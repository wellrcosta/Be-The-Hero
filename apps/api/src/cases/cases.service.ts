import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function parseMoneyToCents(value: string): number {
  // Accept "10", "10.5", "10.50", "10,50".
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new BadRequestException('Invalid money value');
  }

  const [intPart, decPart = ''] = normalized.split('.');
  const cents = Number(intPart) * 100 + Number((decPart + '00').slice(0, 2));

  if (!Number.isFinite(cents)) {
    throw new BadRequestException('Invalid money value');
  }

  return cents;
}

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    title: string;
    description: string;
    value: string;
    organizationId: string;
  }) {
    const valueCents = parseMoneyToCents(data.value);

    return this.prisma.case.create({
      data: {
        title: data.title,
        description: data.description,
        valueCents,
        organizationId: data.organizationId,
      },
    });
  }

  findMany() {
    return this.prisma.case.findMany({ include: { organization: true } });
  }
}
