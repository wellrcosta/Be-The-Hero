import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { serializeCase, serializeOrganization } from '../common/serializers';
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

class UpdateCaseStatusDto {
  @IsString()
  @IsIn(['OPEN', 'CLOSED'])
  status!: 'OPEN' | 'CLOSED';
}

class PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  take?: number;
}

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
export class CasesController {
  constructor(private cases: CasesService) {}

  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a case (ADMIN)' })
  async create(@Body() dto: CreateCaseDto) {
    const created = await this.cases.create(dto);
    return serializeCase(created);
  }

  @Get()
  @ApiOperation({ summary: 'List cases (JWT required)' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20 })
  async findMany(@Query() q: PaginationQuery) {
    const rows = await this.cases.findMany({ skip: q.skip, take: q.take });

    return rows.map((c) => ({
      ...serializeCase(c),
      organization: serializeOrganization(c.organization),
    }));
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update case status (ADMIN)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateCaseStatusDto) {
    const updated = await this.cases.updateStatus(id, dto.status);
    return serializeCase(updated);
  }
}
