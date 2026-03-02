import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { Request, Response } from 'express';

import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { refreshCookieOptions } from './refresh-tokens';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({
    summary: 'Login with email/password and receive a JWT access token',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.auth.login(
      dto.email,
      dto.password,
    );

    res.cookie('refresh_token', refresh_token, {
      ...refreshCookieOptions(),
      maxAge: 30 * 24 * 60 * 60_000,
    });

    return { access_token };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Rotate refresh token cookie and receive a new access token',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) return { access_token: null };

    const { access_token, refresh_token } = await this.auth.refresh(token);

    res.cookie('refresh_token', refresh_token, {
      ...refreshCookieOptions(),
      maxAge: 30 * 24 * 60 * 60_000,
    });

    return { access_token };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke current refresh token cookie and logout' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token as string | undefined;
    if (token) await this.auth.logout(token);

    res.clearCookie('refresh_token', refreshCookieOptions());
    return { ok: true };
  }
}
