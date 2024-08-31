import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user-dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { User } from '../user/user.schema';

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
    const { password, ...rest } = user.toObject();
    return rest;
  }
}
