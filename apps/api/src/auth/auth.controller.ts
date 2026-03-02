import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { Request, Response } from 'express';

import type { JwtPayload } from './jwt.strategy';
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

class RefreshDto {
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

class LogoutDto {
  @IsOptional()
  @IsString()
  refresh_token?: string;
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
    @Req() req: Request,
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isMobile = req.header('x-client') === 'mobile';

    const { access_token, refresh_token } = await this.auth.login(
      dto.email,
      dto.password,
    );

    if (!isMobile) {
      res.cookie('refresh_token', refresh_token, {
        ...refreshCookieOptions(),
        maxAge: 30 * 24 * 60 * 60_000,
      });
      return { access_token };
    }

    // Mobile clients should store refresh tokens securely (e.g. SecureStore)
    return { access_token, refresh_token };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary:
      'Rotate refresh token and receive a new access token (cookie for web; body for mobile)',
  })
  async refresh(
    @Req() req: Request,
    @Body() dto: RefreshDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isMobile = req.header('x-client') === 'mobile';

    const cookieToken = req.cookies?.refresh_token as string | undefined;
    const token = cookieToken ?? dto.refresh_token;
    if (!token) return { access_token: null };

    const { access_token, refresh_token } = await this.auth.refresh(token);

    if (!isMobile) {
      res.cookie('refresh_token', refresh_token, {
        ...refreshCookieOptions(),
        maxAge: 30 * 24 * 60 * 60_000,
      });
      return { access_token };
    }

    return { access_token, refresh_token };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke current refresh token and logout' })
  async logout(
    @Req() req: Request,
    @Body() dto: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      (req.cookies?.refresh_token as string | undefined) ?? dto.refresh_token;

    if (token) await this.auth.logout(token);

    res.clearCookie('refresh_token', refreshCookieOptions());
    return { ok: true };
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Logout from all devices (JWT required)' })
  async logoutAll(@Req() req: Request & { user?: JwtPayload }) {
    await this.auth.logoutAll(req.user!.sub);
    return { ok: true };
  }
}
