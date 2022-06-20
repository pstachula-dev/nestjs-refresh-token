import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tokens } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: await argon2.hash(dto.password),
        },
      });
      return this.updateRefreshToken(newUser.id, newUser.email);
    }

    return this.updateRefreshToken(user.id, user.email);
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    await this.verifyTokens(user.hash, dto.password);
    return this.updateRefreshToken(user.id, user.email);
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async refreshTokens(email: string, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    await this.verifyTokens(user?.refreshToken, refreshToken);

    return this.updateRefreshToken(user.id, user.email);
  }

  async verifyTokens(hash: string, plain: string) {
    if (!hash || !plain) throw new ForbiddenException('access denied');

    const passwordMatch = await argon2.verify(hash, plain);

    if (!passwordMatch) throw new ForbiddenException('access denied');

    return passwordMatch;
  }

  async updateRefreshToken(userId: number, userEmail: string): Promise<Tokens> {
    const tokens = await this.getTokens(userId, userEmail);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: await argon2.hash(tokens.refreshToken),
      },
    });

    return tokens;
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(
        { sub: userId, email },
        {
          expiresIn: '15m',
          secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        },
      ),
      this.jwtService.sign(
        { sub: userId, email },
        {
          expiresIn: '7days',
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
