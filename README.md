# Be The Hero (refactor v2)

Este repositório está sendo refatorado na branch `develop` para uma stack moderna:

- API: NestJS + TypeScript + Prisma + PostgreSQL
- Web: Next.js (App Router) + Tailwind + shadcn/ui

## Requisitos

- Docker + Docker Compose
- Node.js + pnpm (apenas se for rodar fora do Docker)

## Subir o projeto (dev, com Docker)

```bash
git checkout develop

docker compose up -d --build
```

### Acessos

- Web: http://localhost:3001
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Postgres: localhost:5432

### Credenciais de dev (seed)

Por padrão o seed cria um admin:

- **email:** `admin@example.com`
- **password:** `admin123`

> Você pode sobrescrever via env:
> `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Auth (padrão production-friendly)

- `POST /auth/login` → retorna `{ access_token }` e seta cookie httpOnly `refresh_token`
- `POST /auth/refresh` → rotaciona refresh token (cookie) e retorna novo `{ access_token }`
- `POST /auth/logout` → revoga o refresh token atual + limpa cookie
- `POST /auth/logout-all` → revoga **todos** refresh tokens do usuário (JWT required)

O front-end:
- usa `Authorization: Bearer <access_token>`
- em `401`, chama automaticamente `/auth/refresh` e re-tenta a request 1x

## Variáveis de ambiente

Veja `.env.example`.

## Scripts úteis (fora do Docker)

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm --filter api test:e2e
```

### Cleanup de refresh tokens

```bash
pnpm --filter api tokens:cleanup
```

## Notas

- O CI está configurado para rodar em PR e `workflow_dispatch`.
