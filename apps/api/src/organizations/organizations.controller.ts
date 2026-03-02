import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { serializeOrganization } from '../common/serializers';
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

class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private orgs: OrganizationsService) {}

  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create an organization (ADMIN)' })
  async create(@Body() dto: CreateOrganizationDto) {
    const created = await this.orgs.create(dto);
    return serializeOrganization(created);
  }

  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'List organizations (ADMIN)' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20 })
  async findMany(@Query() q: PaginationQuery) {
    const res = await this.orgs.findMany({ skip: q.skip, take: q.take });
    return {
      ...res,
      items: res.items.map(serializeOrganization),
    };
  }

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get organization by id (ADMIN)' })
  async findById(@Param('id') id: string) {
    const org = await this.orgs.findById(id);
    if (!org) throw new NotFoundException('Organization not found');
    return serializeOrganization(org);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update organization (ADMIN)' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    const updated = await this.orgs.update(id, dto);
    return serializeOrganization(updated);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization (ADMIN)' })
  async remove(@Param('id') id: string) {
    await this.orgs.remove(id);
    return { ok: true };
  }
}
