import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Public } from './public.decorator';
import { PrismaService } from '../prisma/prisma.service';

class SeedAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('dev')
export class DevSeedController {
  constructor(private prisma: PrismaService) {}

  @Public()
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
