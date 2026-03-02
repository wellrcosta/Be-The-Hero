# Be The Hero (v2 refactor in progress)

This repository is being refactored in the `develop` branch.

## Requirements
- Docker + Docker Compose

## Quick start (dev)

```bash
cp .env.example .env

docker compose up -d
```

### Services
- API (NestJS): http://localhost:3000
- Web (Next.js): http://localhost:3001
- Postgres: localhost:5432

## Workspace
This repo uses **pnpm workspaces**.

```bash
pnpm -v
pnpm install
```
