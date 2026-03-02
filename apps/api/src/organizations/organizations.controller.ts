import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { OrganizationsService } from './organizations.service';

class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgs: OrganizationsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgs.create(dto);
  }

  @Get()
  findMany() {
    return this.orgs.findMany();
  }
}
