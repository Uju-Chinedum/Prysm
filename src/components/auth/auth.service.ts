import {
  BadRequestException,
  Injectable,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { SignUpDto } from './dto/signup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { User } from 'src/types/app';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  private async createTokens(
    jwtService: JwtService,
    config: ConfigService,
    user: User,
  ) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await jwtService.signAsync(payload, {
      secret: config.get('JWT_SECRET'),
      expiresIn: config.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = await jwtService.signAsync(payload, {
      secret: config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: config.get('REFRESH_TOKEN_EXPIRES_IN'),
    });

    return { payload, accessToken, refreshToken };
  }

  private setTokensAsCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    config: ConfigService,
  ) {
    const accessAge = config.get<number>('JWT_EXPIRES_IN');
    const refreshAge = config.get<number>('REFRESH_TOKEN_EXPIRES_IN');

    const secure = config.get('NODE_ENV') === 'production';
    const sameSite = secure ? 'none' : 'lax';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: accessAge,
      expires: new Date(Date.now() + accessAge!),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: refreshAge,
      expires: new Date(Date.now() + refreshAge!),
    });
  }

  private async signToken(req: Request, res: Response, user: User) {
    try {
      const { payload, accessToken, refreshToken } = await this.createTokens(
        this.jwt,
        this.config,
        user,
      );

      req.user = user;

      this.setTokensAsCookies(res, accessToken, refreshToken, this.config);

      const { password, ...safeUser } = user;
      return {
        message: 'Signed in successfully',
        data: safeUser,
      };
    } catch (error) {
      throw error;
    }
  }

  async signUp(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    dto: SignUpDto,
  ) {
    const { name, email, password } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return this.signToken(req, res, user);
  }

  async signIn(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    dto: SignInDto,
  ) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.signToken(req, res, user);
  }

  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const payload = await this.jwt.verifyAsync(oldRefreshToken, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) throw new UnauthorizedException('User not found');

      const { accessToken, refreshToken } = await this.createTokens(
        this.jwt,
        this.config,
        user,
      );

      this.setTokensAsCookies(res, accessToken, refreshToken, this.config);

      return {
        message: 'Tokens refreshed successfully',
        data: null,
      };
    } catch (err) {
      throw new UnauthorizedException(
        'Invalid credentials',
        'Invalid or expired refresh token',
      );
    }
  }
}
