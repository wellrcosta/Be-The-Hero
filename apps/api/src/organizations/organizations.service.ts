import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findMany(params: { skip?: number; take?: number }) {
    const { skip, take } = params;

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count(),
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
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      state?: string;
    },
  ) {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundException('Organization not found');

    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundException('Organization not found');

    await this.prisma.organization.delete({ where: { id } });
  }
}
