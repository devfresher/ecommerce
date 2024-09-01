import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UserService } from 'src/user/services/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Registration successful')
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const { password, ...rest } = user;
    return rest;
  }
}
