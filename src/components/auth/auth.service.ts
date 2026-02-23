import { BadRequestException, Injectable, Req, Res } from '@nestjs/common';
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

  private async signToken(req: Request, res: Response, user: User) {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
      };

      const secret = this.config.get('JWT_SECRET');
      const refreshSecret = this.config.get('REFRESH_TOKEN_SECRET');

      const accessToken = await this.jwt.signAsync(payload, {
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
        secret,
      });

      const refreshToken = await this.jwt.signAsync(payload, {
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN'),
        secret: refreshSecret,
      });

      req.user = payload;

      const oneDay = 24 * 60 * 60 * 1000;
      const sevenDays = 7 * oneDay;

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: this.config.get('NODE_ENV') === 'production' ? true : false,
        sameSite: this.config.get('NODE_ENV') === 'production' ? 'none' : 'lax',
        maxAge: oneDay,
        expires: new Date(Date.now() + oneDay),
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.config.get('NODE_ENV') === 'production' ? true : false,
        sameSite: this.config.get('NODE_ENV') === 'production' ? 'none' : 'lax',
        maxAge: sevenDays,
        expires: new Date(Date.now() + sevenDays),
      });

      // remove passwrord from user object before returning
      const { password, ...safeUser } = user;

      return {
        message: 'Signed In Successfully',
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
}
