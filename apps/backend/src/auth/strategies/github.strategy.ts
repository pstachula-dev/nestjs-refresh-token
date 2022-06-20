import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

export type JwtPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: '12e4f2f66b384146423f',
      clientSecret: '63b8c9382d5f68aa103c91113d6ce83cfba3c328',
      callbackURL: 'http://localhost:4000/auth/github/callback',
      scope: ['public_profile'],
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    return { accessToken, refreshToken, profile, done };
  }
}
