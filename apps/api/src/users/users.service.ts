import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { assertStrongPassword } from '../auth/password-policy';
import type { Role } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(params: { email: string; password: string; roles: Role[] }) {
    const email = params.email.trim();
    const emailNorm = email.toLowerCase();

    assertStrongPassword(params.password);

    const existing = await this.prisma.user.findUnique({
      where: { emailNorm },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(params.password, 12);

    return this.prisma.user.create({
      data: {
        email,
        emailNorm,
        passwordHash,
        roles: params.roles,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        roles: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async setStatus(id: string, status: 'ACTIVE' | 'DISABLED') {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        status,
        failedLoginAttempts:
          status === 'ACTIVE' ? 0 : existing.failedLoginAttempts,
        lockedUntil: status === 'ACTIVE' ? null : existing.lockedUntil,
      },
      select: {
        id: true,
        email: true,
        roles: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async setRoles(id: string, roles: Role[]) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { roles },
      select: {
        id: true,
        email: true,
        roles: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async adminResetPassword(id: string, newPassword: string) {
    assertStrongPassword(newPassword);

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  async changeMyPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    assertStrongPassword(newPassword);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new BadRequestException('Invalid current password');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
