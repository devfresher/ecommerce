import { ApiHideProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { MatchWith } from 'src/common/decorators/match.decorator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(6, { message: 'Confirm password must be at least 6 characters' })
  @MatchWith('password', { message: 'Passwords do not match' })
  confirmPassword!: string;

  @ApiHideProperty()
  role?: string;
}
