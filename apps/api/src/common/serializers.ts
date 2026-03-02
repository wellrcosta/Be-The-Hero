import type { Case, Organization } from '../generated/prisma/client';
import { centsToMoneyString } from './money';

export function serializeOrganization(org: Organization) {
  return {
    id: org.id,
    name: org.name,
    email: org.email,
    phone: org.phone,
    city: org.city,
    state: org.state,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

export function serializeCase(c: Case) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    value: centsToMoneyString(c.valueCents),
    status: c.status,
    organizationId: c.organizationId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}
