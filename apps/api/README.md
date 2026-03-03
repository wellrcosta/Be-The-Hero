# API (NestJS)

## Rodar via Docker

A forma recomendada em dev é usar o `docker compose` na raiz do repo.

## Endpoints principais

- `GET /health` (public)
- `GET /docs` (Swagger)

### Auth

- `POST /auth/login` (public) → `{ access_token }` + cookie `refresh_token`
- `POST /auth/refresh` (public) → `{ access_token | null }` + rotação do cookie
- `POST /auth/logout` (public) → `{ ok: true }`
- `POST /auth/logout-all` (JWT) → `{ ok: true }`

### Users

- `GET /me` (JWT)
- `POST /users` (ADMIN)
- `PATCH /users/:id/status` (ADMIN)
- `PATCH /users/:id/roles` (ADMIN)
- `PATCH /users/:id/password` (ADMIN)
- `PATCH /me/password` (JWT)

## Produção (hardening)

Em `NODE_ENV=production`, a API exige:
- `JWT_SECRET`
- `CORS_ORIGINS`
- `REFRESH_TOKEN_PEPPER`
