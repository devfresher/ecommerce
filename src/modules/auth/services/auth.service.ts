import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../user/services/user.service';
import { LoginUserDto } from '../../user/dto/login-user-dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.get({ filter: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isBanned)
        throw new UnauthorizedException('Your account has been banned, please contact support');

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
