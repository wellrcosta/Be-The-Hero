import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user (JWT required)' })
  me(@Req() req: any) {
    // req.user is populated by JwtStrategy.validate
    return {
      sub: req.user?.sub,
      email: req.user?.email,
      roles: req.user?.roles ?? [],
    };
  }
}
