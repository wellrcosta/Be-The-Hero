import { Injectable } from @nestjs/common;
import { PrismaClient } from ../generated/prisma/client;

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({ datasourceUrl: process.env.DATABASE_URL });
  }
}
