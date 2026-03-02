import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseMoneyToCents } from '../common/money';

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

  findMany(params: { skip?: number; take?: number }) {
    const { skip, take } = params;
    return this.prisma.case.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { organization: true },
    });
  }

  async updateStatus(id: string, status: 'OPEN' | 'CLOSED') {
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case not found');

    return this.prisma.case.update({
      where: { id },
      data: { status },
    });
  }
}
