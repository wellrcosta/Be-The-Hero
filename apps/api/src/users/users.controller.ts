import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { assertStrongPassword } from '../auth/password-policy';

class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;

  @IsEnum(['USER', 'ADMIN'], { each: true })
  roles!: Array<'USER' | 'ADMIN'>;
}

class SetStatusDto {
  @IsEnum(['ACTIVE', 'DISABLED'])
  status!: 'ACTIVE' | 'DISABLED';
}

class SetRolesDto {
  @IsEnum(['USER', 'ADMIN'], { each: true })
  roles!: Array<'USER' | 'ADMIN'>;
}

class AdminResetPasswordDto {
  @IsString()
  @MinLength(12)
  newPassword!: string;
}

class ChangeMyPasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(12)
  newPassword!: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user (JWT required)' })
  me(@Req() req: Request & { user?: JwtPayload }) {
    return {
      sub: req.user?.sub,
      email: req.user?.email,
      roles: req.user?.roles ?? [],
    };
  }

  @Post('users')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a user (ADMIN only)' })
  create(@Body() dto: CreateUserDto) {
    // Additional server-side policy check
    assertStrongPassword(dto.password);
    return this.users.createUser({
      email: dto.email,
      password: dto.password,
      roles: dto.roles,
    });
  }

  @Patch('users/:id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Enable/disable a user (ADMIN only)' })
  setStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    return this.users.setStatus(id, dto.status);
  }

  @Patch('users/:id/roles')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user roles (ADMIN only)' })
  setRoles(@Param('id') id: string, @Body() dto: SetRolesDto) {
    return this.users.setRoles(id, dto.roles);
  }

  @Patch('users/:id/password')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Reset user password (ADMIN only)' })
  async adminResetPassword(
    @Param('id') id: string,
    @Body() dto: AdminResetPasswordDto,
  ) {
    assertStrongPassword(dto.newPassword);
    await this.users.adminResetPassword(id, dto.newPassword);
    return { ok: true };
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change my password (JWT required)' })
  async changeMyPassword(
    @Req() req: Request & { user?: JwtPayload },
    @Body() dto: ChangeMyPasswordDto,
  ) {
    assertStrongPassword(dto.newPassword);
    await this.users.changeMyPassword(
      req.user!.sub,
      dto.currentPassword,
      dto.newPassword,
    );
    return { ok: true };
  }
}
