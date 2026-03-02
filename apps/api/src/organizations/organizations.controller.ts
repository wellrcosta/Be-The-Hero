import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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

class PaginationQuery {
  @IsOptional()
  @Min(0)
  skip?: number;

  @IsOptional()
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

  @Get()
  @ApiOperation({ summary: 'List organizations (JWT required)' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20 })
  async findMany(@Query() q: PaginationQuery) {
    const rows = await this.orgs.findMany({ skip: q.skip, take: q.take });
    return rows.map(serializeOrganization);
  }
}
