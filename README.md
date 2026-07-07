# Be The Hero

A full-stack reference implementation of the classic **Be The Hero** app, rebuilt with a modern, production-friendly stack:

- **API:** NestJS + TypeScript + Prisma + PostgreSQL
- **Web:** Next.js (App Router) + Tailwind + shadcn/ui
- **Mobile:** Expo (React Native) + TypeScript

## Requirements

- Docker + Docker Compose (recommended)
- Node.js + pnpm (only if you want to run outside Docker)

## Quick start (dev with Docker)

```bash
# Make sure you are on the right branch
git checkout develop

# Start everything
docker compose up -d --build
```

### URLs

- Web: http://localhost:3001
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Postgres: localhost:5432

## Default dev credentials (seed)

The seed creates an admin user by default:

- email: `admin@example.com`
- password: `admin123`

You can override using env vars:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Authentication model

This project uses **short-lived access tokens** + **refresh tokens**.

### Web (browser)

- `POST /auth/login` → returns `{ access_token }` and sets an **httpOnly** `refresh_token` cookie
- `POST /auth/refresh` → rotates the refresh token cookie and returns a new `{ access_token }`
- `POST /auth/logout` → revokes current refresh token and clears cookie
- `POST /auth/logout-all` → revokes **all** refresh tokens for the current user (JWT required)

The Web client:
- sends `Authorization: Bearer <access_token>`
- on `401`, automatically calls `/auth/refresh` and retries the request once

### Mobile (Expo)

Mobile clients send `x-client: mobile`.

- `POST /auth/login` → returns `{ access_token, refresh_token }`
- `POST /auth/refresh` → returns `{ access_token, refresh_token }` (rotation)

The mobile app stores tokens using `expo-secure-store` and retries once on `401`.

## Environment variables

See `.env.example`.

Production hardening:
- In `NODE_ENV=production`, the API requires: `JWT_SECRET`, `CORS_ORIGINS`, `REFRESH_TOKEN_PEPPER`.

## Useful commands (outside Docker)

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm --filter api test:e2e
```

### Refresh token cleanup

```bash
pnpm --filter api tokens:cleanup
```

## Mobile (local dev)

> Important: on a real device/emulator, `localhost` points to the device itself.
> Use the VM/LAN IP of your API.

```bash
cd mobile

export EXPO_PUBLIC_API_URL=http://192.168.1.171:3000
npm install
npm start
```

## CI

The GitHub Actions workflow validates:
- install (lockfile)
- prisma generate (api)
- lint
- typecheck
- build
- api e2e tests
