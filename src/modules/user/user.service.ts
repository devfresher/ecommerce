import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user-dto';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class UserService extends BaseService<User, UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel, User, 'User');
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.get({ filter: { email: data.email } });
    if (user) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const createdUser = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return createdUser.save();
  }
}
