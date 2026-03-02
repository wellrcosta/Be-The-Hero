FROM node:25-bookworm

WORKDIR /app

# pnpm
RUN npm i -g pnpm@10.30.3

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

# Prisma needs schema/config during postinstall (prisma generate)
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["pnpm","start:dev"]
