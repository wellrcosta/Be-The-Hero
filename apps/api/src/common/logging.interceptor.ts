import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string }>();
    const res = context.switchToHttp().getResponse<Response>();

    const incoming = (req.headers['x-request-id'] ??
      req.headers['x-correlation-id']) as string | undefined;
    const requestId = incoming ?? randomUUID();

    req.requestId = requestId;
    // Keep a copy in response; do not mutate req.headers type
    res.setHeader('x-request-id', requestId);

    return next.handle();
  }
}
