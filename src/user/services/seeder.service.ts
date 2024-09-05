import { Inject, Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();

    if (this.configService.get<string>('seedUserAndProduct') === 'true') {
      await this.seedExampleUser();
    }
  }

  /**
   * Seeds an admin user into the database if it does not already exist.
   *
   * The admin user is created with the email 'admin@example.com' and the password 'Password123'.
   * The user is assigned the 'admin' role.
   *
   * If the user already exists, this function does nothing.
   */
  private async seedAdminUser() {
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
      this.logger.log('Admin user seeded successfully.');
    }
  }

  /**
   * Seeds a demo user into the database if it does not already exist.
   *
   * The demo user is created with the email 'demo-user@example.com' and the password 'Password123'.
   *
   * If the user already exists, this function does nothing.
   */
  private async seedExampleUser() {
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
      this.logger.log('User seeded successfully.');
    }
  }
}
