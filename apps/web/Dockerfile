FROM node:25-bookworm

WORKDIR /app

RUN npm i -g pnpm@10.30.3

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web apps/web

WORKDIR /app/apps/web
EXPOSE 3001

CMD ["pnpm","dev","--port","3001"]
