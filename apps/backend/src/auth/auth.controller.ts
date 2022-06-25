import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Get,
} from '@nestjs/common';
// import * as argon2 from 'argon2';
// import { AuthGuard } from '@nestjs/passport';
// import { randomUUID } from 'crypto';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ONE_DAY_MS } from './common/constants';
import { GetCurrentUser } from './common/decorators/get-current-user.decorator';
import { JwtAtAuthGuard } from './common/guards/at.guard';
import { JwtRtAuthGuard } from './common/guards/rt.guard';
import { AuthDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/access-token.strategy';
import { Tokens } from './types/auth.types';

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  maxAge: 7 * ONE_DAY_MS,
  secure: true,
  sameSite: 'none',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('csrf')
  @HttpCode(HttpStatus.OK)
  async getCSRF() {
    return true;
  }

  @UseGuards(JwtAtAuthGuard)
  @Get('protected')
  @HttpCode(HttpStatus.OK)
  async getProtected() {
    return ['PROTECTED', 'DATA'];
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.signinLocal(dto);
    res.cookie('RefreshToken', tokens['refreshToken'], authCookieOptions);

    return tokens;
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @UseGuards(JwtAtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('RefreshToken');
    return this.authService.logout(user.sub);
  }

  @UseGuards(JwtRtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const tokens = await this.authService.refreshTokens(
      user['email'],
      user['refreshToken'],
    );
    res.cookie('RefreshToken', tokens['refreshToken'], authCookieOptions);

    return tokens;
  }
}
