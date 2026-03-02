import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const emailNorm = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({ where: { emailNorm } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Account status/lock checks
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const maxAttempts = Number(
        process.env.AUTH_MAX_FAILED_LOGIN_ATTEMPTS ?? 10,
      );
      const lockMinutes = Number(process.env.AUTH_LOCK_MINUTES ?? 15);

      const nextAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const shouldLock = nextAttempts >= maxAttempts;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + lockMinutes * 60_000)
            : null,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful auth: reset counters
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

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
}
