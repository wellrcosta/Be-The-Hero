import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @SkipThrottle()
  @Get()
  getHealth() {
    return { ok: true };
  }
}
