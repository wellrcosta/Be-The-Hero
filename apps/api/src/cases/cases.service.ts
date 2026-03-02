import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseMoneyToCents } from '../common/money';
import type { Prisma } from '../generated/prisma/client';

export type CaseStatus = 'OPEN' | 'CLOSED';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    title: string;
    description: string;
    value: string;
    organizationId: string;
  }) {
    let valueCents: number;
    try {
      valueCents = parseMoneyToCents(data.value);
    } catch {
      throw new BadRequestException('Invalid money value');
    }

    return this.prisma.case.create({
      data: {
        title: data.title,
        description: data.description,
        valueCents,
        organizationId: data.organizationId,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    status?: CaseStatus;
    organizationId?: string;
  }) {
    const { skip, take, status, organizationId } = params;

    const where: Prisma.CaseWhereInput = {};
    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;

    const [items, total] = await Promise.all([
      this.prisma.case.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: { organization: true },
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      items,
      page: {
        skip: skip ?? 0,
        take: take ?? items.length,
        total,
      },
    };
  }

  findById(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      value?: string;
    },
  ) {
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case not found');

    const updateData: Prisma.CaseUpdateInput = {
      title: data.title,
      description: data.description,
    };

    if (typeof data.value === 'string') {
      try {
        updateData.valueCents = parseMoneyToCents(data.value);
      } catch {
        throw new BadRequestException('Invalid money value');
      }
    }

    return this.prisma.case.update({
      where: { id },
      data: updateData,
      include: { organization: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case not found');

    await this.prisma.case.delete({ where: { id } });
  }

  async updateStatus(id: string, status: CaseStatus) {
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case not found');

    return this.prisma.case.update({
      where: { id },
      data: { status },
      include: { organization: true },
    });
  }
}
