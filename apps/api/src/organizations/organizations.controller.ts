import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrganizationsService } from './organizations.service';

class CreateOrganizationDto {
  name!: string;
  email!: string;
  phone?: string;
  city?: string;
  state?: string;
}

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgs: OrganizationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgs.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMany() {
    return this.orgs.findMany();
  }
}
