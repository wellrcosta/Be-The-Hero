/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

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
    await db.query('DELETE FROM "Case";');
    await db.query('DELETE FROM "Organization";');
    await db.query('DELETE FROM "User";');
  });

  async function seedAdmin() {
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

    return {
      token: loginRes.body.access_token as string,
      email,
    };
  }

  it('GET /health should be public', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });

  it('GET /organizations should require JWT', async () => {
    await request(app.getHttpServer()).get('/organizations').expect(401);
  });

  it('Core flows: /me + org/case CRUD + status', async () => {
    const { token, email } = await seedAdmin();

    const meRes = await request(app.getHttpServer())
      .get('/me')
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body.email).toBe(email);
    expect(meRes.body.roles).toContain('ADMIN');

    const orgRes = await request(app.getHttpServer())
      .post('/organizations')
      .set('authorization', `Bearer ${token}`)
      .send({ name: 'Acme', email: 'contact@acme.org' })
      .expect(201);

    const orgId: string = orgRes.body.id;

    await request(app.getHttpServer())
      .get(`/organizations/${orgId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    const orgUpd = await request(app.getHttpServer())
      .patch(`/organizations/${orgId}`)
      .set('authorization', `Bearer ${token}`)
      .send({ city: 'SP' })
      .expect(200);

    expect(orgUpd.body.city).toBe('SP');

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

    const caseId: string = caseRes.body.id;

    const listRes = await request(app.getHttpServer())
      .get('/cases?skip=0&take=10')
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body.items)).toBe(true);
    expect(listRes.body.items.length).toBe(1);

    const getCase = await request(app.getHttpServer())
      .get(`/cases/${caseId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(getCase.body.id).toBe(caseId);

    const updCase = await request(app.getHttpServer())
      .patch(`/cases/${caseId}`)
      .set('authorization', `Bearer ${token}`)
      .send({ title: 'Case 1 edited', value: '11.00' })
      .expect(200);

    expect(updCase.body.title).toBe('Case 1 edited');
    expect(updCase.body.value).toBe('11.00');

    const closeRes = await request(app.getHttpServer())
      .patch(`/cases/${caseId}/status`)
      .set('authorization', `Bearer ${token}`)
      .send({ status: 'CLOSED' })
      .expect(200);

    expect(closeRes.body.status).toBe('CLOSED');

    const reopenRes = await request(app.getHttpServer())
      .patch(`/cases/${caseId}/status`)
      .set('authorization', `Bearer ${token}`)
      .send({ status: 'OPEN' })
      .expect(200);

    expect(reopenRes.body.status).toBe('OPEN');

    await request(app.getHttpServer())
      .delete(`/cases/${caseId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/organizations/${orgId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });
});
