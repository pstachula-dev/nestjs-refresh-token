import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ONE_DAY_MS } from './common/constants';
import { GetCurrentUser } from './common/decorators/get-current-user.decorator';
import { JwtAtAuthGuard } from './common/guards/at.guard';
import { JwtRtAuthGuard } from './common/guards/rt.guard';
import { AuthDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/at.strategy';
import { Tokens } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Post('local/signup')
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
    res.cookie('RefreshToken', null);
    return this.authService.logout(user.sub);
  }

  @UseGuards(JwtRtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    res.cookie('RefreshToken', user['refreshToken'], {
      httpOnly: true,
      maxAge: 7 * ONE_DAY_MS,
    });

    return this.authService.refreshTokens(user['email'], user['refreshToken']);
  }
}
