import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import request from 'supertest';

import { AppModule } from '../src/app.module';

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  return new Client({ connectionString: process.env.DATABASE_URL });
}

describe('API (e2e)', () => {
  let app: INestApplication;
  let db: Client;

  beforeAll(async () => {
    db = getDb();
    await db.connect();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await db.end();
  });

  beforeEach(async () => {
    // Clean tables between tests
    await db.query('DELETE FROM "Case";');
    await db.query('DELETE FROM "Organization";');
    await db.query('DELETE FROM "User";');
  });

  it('GET /health should be public', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });

  it('GET /organizations should require JWT', async () => {
    await request(app.getHttpServer()).get('/organizations').expect(401);
  });

  it('Auth + Organizations + Cases happy path', async () => {
    const email = 'admin@example.com';
    const password = 'admin123';

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO "User" (id, email, "passwordHash", roles, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, ARRAY[\'ADMIN\']::"Role"[], NOW(), NOW());',
      [email, passwordHash],
    );

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    expect(loginRes.body.access_token).toBeTruthy();
    const token: string = loginRes.body.access_token;

    const orgRes = await request(app.getHttpServer())
      .post('/organizations')
      .set('authorization', `Bearer ${token}`)
      .send({ name: 'Acme', email: 'contact@acme.org' })
      .expect(201);

    expect(orgRes.body.id).toBeTruthy();
    const orgId: string = orgRes.body.id;

    const caseRes = await request(app.getHttpServer())
      .post('/cases')
      .set('authorization', `Bearer ${token}`)
      .send({
        title: 'Case 1',
        description: 'Help needed',
        value: '10.50',
        organizationId: orgId,
      })
      .expect(201);

    expect(caseRes.body.value).toBe('10.50');
    expect(caseRes.body.status).toBe('OPEN');

    const listRes = await request(app.getHttpServer())
      .get('/cases?skip=0&take=10')
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBe(1);

    const caseId: string = listRes.body[0].id;

    const statusRes = await request(app.getHttpServer())
      .patch(`/cases/${caseId}/status`)
      .set('authorization', `Bearer ${token}`)
      .send({ status: 'CLOSED' })
      .expect(200);

    expect(statusRes.body.status).toBe('CLOSED');
  });
});
