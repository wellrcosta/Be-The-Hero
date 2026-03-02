import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const requestId =
      req.headers['x-request-id'] ?? req.headers['x-correlation-id'] ?? randomUUID();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    return next.handle();
  }
}
