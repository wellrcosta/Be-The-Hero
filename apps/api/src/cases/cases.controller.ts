import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { serializeCase, serializeOrganization } from '../common/serializers';
import { CasesService } from './cases.service';
import type { CaseStatus } from './cases.service';

class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  /** Monetary value in major units (e.g. "10.50" for BRL). */
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  organizationId!: string;
}

class UpdateCaseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  value?: string;
}

class UpdateCaseStatusDto {
  @IsString()
  @IsIn(['OPEN', 'CLOSED'])
  status!: CaseStatus;
}

class CasesQuery {
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  take?: number;

  @IsOptional()
  @IsIn(['OPEN', 'CLOSED'])
  status?: CaseStatus;

  @IsOptional()
  @IsString()
  organizationId?: string;
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
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED'] })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  async findMany(@Query() q: CasesQuery) {
    const res = await this.cases.findMany({
      skip: q.skip,
      take: q.take,
      status: q.status,
      organizationId: q.organizationId,
    });

    return {
      ...res,
      items: res.items.map((c) => ({
        ...serializeCase(c),
        organization: serializeOrganization(c.organization),
      })),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case by id (JWT required)' })
  async findById(@Param('id') id: string) {
    const c = await this.cases.findById(id);
    if (!c) throw new NotFoundException('Case not found');
    return {
      ...serializeCase(c),
      organization: serializeOrganization(c.organization),
    };
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update case (ADMIN)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    const updated = await this.cases.update(id, dto);
    return {
      ...serializeCase(updated),
      organization: serializeOrganization(updated.organization),
    };
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete case (ADMIN)' })
  async remove(@Param('id') id: string) {
    await this.cases.remove(id);
    return { ok: true };
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update case status (ADMIN)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCaseStatusDto,
  ) {
    const updated = await this.cases.updateStatus(id, dto.status);
    return {
      ...serializeCase(updated),
      organization: serializeOrganization(updated.organization),
    };
  }
}
