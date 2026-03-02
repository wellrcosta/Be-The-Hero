# Web (Next.js)

## Rodar via Docker

Use o `docker compose` na raiz do repo.

## Config

- O Web consome a API via proxy `/api` (para funcionar bem por IP da VM/LAN)
- Em requests autenticadas, envia `Authorization: Bearer <token>`
- Cookies (refresh token httpOnly) são enviados com `credentials: include`

## Login

- Dev admin: `admin@example.com` / `admin123`
