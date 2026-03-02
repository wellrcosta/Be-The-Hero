import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
  }) {
    return this.prisma.organization.create({ data });
  }

  findMany(params: { skip?: number; take?: number }) {
    const { skip, take } = params;
    return this.prisma.organization.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
