import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user-dto';
import { BaseService } from 'src/common/services/base.service';
import { PaginatedResult } from 'src/common/typings/paginate';
import { FindAllOption, PageOptions, QueryOptions, Role } from 'src/common/typings/core';

@Injectable()
export class UserService extends BaseService<User, UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel, User, 'User');
  }

  defaultRelations = [];

  /**
   * Retrieves all users that match the given filter conditions.
   *
   * @param pageOpts Options for pagination.
   * @param queryOpts Options for filtering the results.
   * @returns A list of users, or a paginated result if pagination options are provided.
   */
  async getAll(
    pageOpts: PageOptions,
    queryOpts: QueryOptions,
  ): Promise<User[] | PaginatedResult<User>> {
    const options: FindAllOption<UserDocument> = {
      pageOpts,
      relations: this.defaultRelations,
      sort: { createdAt: queryOpts.sortOrder },
      filter: {
        ...(queryOpts.role && { role: queryOpts.role }),
      },
    };

    if (queryOpts.search) {
      options.filter = {
        $or: [
          { name: { $regex: queryOpts.search, $options: 'i' } },
          { email: { $regex: queryOpts.search, $options: 'i' } },
        ],
      };
    }

    const users = await this.getAllForService(options);
    return users;
  }

  async create(data: CreateUserDto): Promise<UserDocument> {
    const user = await this.get({ filter: { email: data.email } });
    if (user) throw new ConflictException('User already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const createdUser = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async toggleBan(id: string) {
    const session = await this.userModel.startSession();
    session.startTransaction();
    try {
      const user = await this.getOrError({ filter: { _id: id } }, session);
      user.isBanned = !user.isBanned;
      await user.save({ session });
      await session.commitTransaction();
      return user;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
