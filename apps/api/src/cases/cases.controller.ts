import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CasesService } from './cases.service';

class CreateCaseDto {
  title!: string;
  description!: string;
  valueCents!: number;
  organizationId!: string;
}

@Controller('cases')
export class CasesController {
  constructor(private cases: CasesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCaseDto) {
    return this.cases.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMany() {
    return this.cases.findMany();
  }
}
