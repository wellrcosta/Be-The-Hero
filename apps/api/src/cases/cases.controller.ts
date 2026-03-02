import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CasesService } from './cases.service';

class CreateCaseDto {
  title!: string;
  description!: string;
  /** Monetary value in major units (e.g. "10.50" for BRL). */
  value!: string;
  organizationId!: string;
}

@Controller('cases')
export class CasesController {
  constructor(private cases: CasesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCaseDto) {
    return this.cases.create({
      title: dto.title,
      description: dto.description,
      value: dto.value,
      organizationId: dto.organizationId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findMany() {
    const rows = await this.cases.findMany();
    return rows.map((c) => ({
      ...c,
      value: (c.valueCents / 100).toFixed(2),
    }));
  }
}
