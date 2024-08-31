import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedUser();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@example.com';
    const adminExists = await this.userService.get({ filter: { email: adminEmail } });

    if (!adminExists) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('Password123', salt);

      const admin = new this.userModel({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      await admin.save();
      console.log('Admin user seeded successfully.');
    }
  }

  private async seedUser() {
    const userEmail = 'demo-user@example.com';
    const userExists = await this.userService.get({ filter: { email: userEmail } });

    if (!userExists) {
      const userData: CreateUserDto = {
        name: 'User 1',
        email: userEmail,
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      await this.userService.create(userData);
      console.log('User seeded successfully.');
    }
  }
}
