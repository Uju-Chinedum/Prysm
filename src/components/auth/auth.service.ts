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
import { randomUUID } from 'node:crypto';

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
    const jti = randomUUID();
    const payload = { sub: user.id, email: user.email };

    const accessToken = await jwtService.signAsync(payload, {
      secret: config.get('JWT_SECRET'),
      expiresIn: config.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = await jwtService.signAsync(
      { ...payload, jti },
      {
        secret: config.get('REFRESH_TOKEN_SECRET'),
        expiresIn: config.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    return { accessToken, refreshToken, jti };
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

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
    jti: string,
    expiresAt: Date,
  ) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        jti,
        userId,
        expiresAt,
      },
    });
  }

  private async signToken(req: Request, res: Response, user: User) {
    try {
      const { accessToken, refreshToken, jti } = await this.createTokens(
        this.jwt,
        this.config,
        user,
      );

      const refreshTtl = Number(this.config.get('REFRESH_TOKEN_EXPIRES_IN'))!;
      const expiresAt = new Date(Date.now() + refreshTtl);

      await this.saveRefreshToken(user.id, refreshToken, jti, expiresAt);

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

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let payload: any;

    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { sub: userId, jti } = payload;

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { jti },
    });

    if (!tokenRecord || tokenRecord.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // delete old record
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      jti: newJti,
    } = await this.createTokens(this.jwt, this.config, user);

    const refreshTtl = Number(this.config.get('REFRESH_TOKEN_EXPIRES_IN'))!;
    const expiresAt = new Date(Date.now() + refreshTtl);

    await this.saveRefreshToken(user.id, newRefreshToken, newJti, expiresAt);

    this.setTokensAsCookies(res, accessToken, newRefreshToken, this.config);

    return { message: 'Tokens refreshed successfully' };
  }

  async signout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const payload = this.jwt.decode(refreshToken) as any;

      if (payload?.jti) {
        await this.prisma.refreshToken.deleteMany({
          where: { jti: payload.jti },
        });
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Signed out successfully' };
  }
}
