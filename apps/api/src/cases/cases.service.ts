import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    title: string;
    description: string;
    valueCents: number;
    organizationId: string;
  }) {
    return this.prisma.case.create({ data });
  }

  findMany() {
    return this.prisma.case.findMany({ include: { organization: true } });
  }
}
