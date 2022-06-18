import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/auth/strategies/at.strategy';

export const GetCurrentUser = createParamDecorator(
  (_, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
