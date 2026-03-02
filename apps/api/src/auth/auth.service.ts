import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { generateRefreshToken, hashRefreshToken } from './refresh-tokens';

const ACCESS_TOKEN_TTL_SECONDS = Number(
  process.env.ACCESS_TOKEN_TTL_SECONDS ?? '900',
);
const REFRESH_TOKEN_TTL_DAYS = Number(
  process.env.REFRESH_TOKEN_TTL_DAYS ?? '30',
);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private async validateUser(email: string, password: string) {
    const emailNorm = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { emailNorm } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User is disabled');
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const attempts = user.failedLoginAttempts + 1;

      const lockAfter = Number(process.env.LOCK_AFTER_ATTEMPTS ?? '10');
      const lockMinutes = Number(process.env.LOCK_DURATION_MINUTES ?? '15');
      const lockedUntil =
        attempts >= lockAfter
          ? new Date(Date.now() + lockMinutes * 60_000)
          : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    return user;
  }

  private issueAccessToken(user: {
    id: string;
    email: string;
    roles: unknown;
  }) {
    return this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
      },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const access_token = await this.issueAccessToken(user);

    const refresh = generateRefreshToken();
    const tokenHash = hashRefreshToken(refresh);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { access_token, refresh_token: refresh };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) throw new UnauthorizedException('Invalid refresh token');
    if (existing.revokedAt)
      throw new UnauthorizedException('Refresh token revoked');
    if (existing.expiresAt <= new Date())
      throw new UnauthorizedException('Refresh token expired');

    if (existing.user.status !== 'ACTIVE') {
      throw new ForbiddenException('User is disabled');
    }

    const nextRefresh = generateRefreshToken();
    const nextHash = hashRefreshToken(nextRefresh);
    const nextExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000,
    );

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: nextHash,
          expiresAt: nextExpiresAt,
        },
      });

      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date(), replacedById: created.id },
      });
    });

    const access_token = await this.issueAccessToken(existing.user);

    return { access_token, refresh_token: nextRefresh };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
