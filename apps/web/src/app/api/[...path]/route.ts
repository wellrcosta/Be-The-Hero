import { NextRequest } from 'next/server';

const API_INTERNAL = process.env.API_INTERNAL_URL ?? 'http://api:3000';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

async function proxy(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  const target = `${API_INTERNAL}/${path.join('/')}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
    // @ts-expect-error duplex is required for Node fetch in some runtimes when sending a body
    duplex: 'half',
  };

  const upstream = await fetch(target, init);

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete('transfer-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}
