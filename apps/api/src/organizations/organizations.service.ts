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

  findMany() {
    return this.prisma.organization.findMany();
  }
}
