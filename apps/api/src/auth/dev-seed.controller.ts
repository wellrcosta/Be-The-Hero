import { Body, Controller, Post } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

class SeedAdminDto {
  email!: string;
  password!: string;
}

@Controller('dev')
export class DevSeedController {
  constructor(private prisma: PrismaService) {}

  @Post('seed-admin')
  async seedAdmin(@Body() dto: SeedAdminDto) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, error: 'disabled' };
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) return { ok: true, userId: existing.id, created: false };

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        roles: ['ADMIN'],
      },
    });

    return { ok: true, userId: user.id, created: true };
  }
}
