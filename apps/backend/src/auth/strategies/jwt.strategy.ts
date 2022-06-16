// access_token
// - lifespan 15 min
// - rs256
// refresh_token
//  - 1 week
//  - es256

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super_secret_password',
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
