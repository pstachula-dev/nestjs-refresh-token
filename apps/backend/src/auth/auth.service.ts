import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthDto } from './dto/auth.dto';
import { users } from './users';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  signJwtUser(userId: number, email: string, type: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
      type,
    });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    console.log(username, pass);
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  signinLocal(dto: AuthDto) {
    const user = users.find((user) => user.email === dto.email);
    if (!user) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    if (user.password !== dto.password) {
      throw new UnauthorizedException('Pass  incorrect');
    }

    return this.signJwtUser(user.id, user.email, 'user');
  }

  signupLocal(dto: AuthDto) {}
}
