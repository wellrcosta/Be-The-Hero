import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { CasesService } from './cases.service';

class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  /** Monetary value in major units (e.g. 10.50 for BRL). */
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  organizationId!: string;
}

@Controller('cases')
export class CasesController {
  constructor(private cases: CasesService) {}

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

  @Get()
  async findMany() {
    const rows = await this.cases.findMany();
    return rows.map((c) => ({
      ...c,
      value: (c.valueCents / 100).toFixed(2),
    }));
  }
}
