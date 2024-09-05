import { Controller, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { UserService } from './services/user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PageOptions, QueryOptions, Role } from 'src/common/typings/core';
import { Roles } from 'src/common/decorators/role.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CustomQuery } from 'src/common/decorators/query-options.decorator';
import { Page } from 'src/common/decorators/page-options.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectId.pipe';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves all users that match the given filter conditions.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get()
  @ResponseMessage('All users retrieved successfully')
  getAllUsers(@CustomQuery() queryOpts: QueryOptions, @Page() pageOpts: PageOptions) {
    return this.userService.getAll(pageOpts, queryOpts);
  }

  /**
   * Toggles the ban status of a user.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch('/:id/toggle-ban/')
  @ResponseMessage('User updated successfully')
  async toggleBan(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.toggleBan(id);
  }

  /**
   * Retrieves a single user by its ID.
   */
  @Get('/:id')
  @ResponseMessage('User retrieved successfully')
  async getOne(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.getOrError({ filter: { _id: id } });
  }
}
