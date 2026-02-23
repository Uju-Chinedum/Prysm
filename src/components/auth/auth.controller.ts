import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async create(
    @Body() body: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(req, res, body);
  }

  @Post('signin')
  async login(
    @Body() body: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(req, res, body);
  }
}
