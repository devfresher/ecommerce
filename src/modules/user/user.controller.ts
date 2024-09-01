import { Controller, Post, Body, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { UserService } from './services/user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PageOptions, QueryOptions, Role } from 'src/common/typings/core';
import { Roles } from 'src/common/decorators/role.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CustomQuery } from 'src/common/decorators/query-options.decorator';
import { Page } from 'src/common/decorators/page-options.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get()
  @ResponseMessage('All users retrieved successfully')
  getAllUsers(@CustomQuery() queryOpts: QueryOptions, @Page() pageOpts: PageOptions) {
    return this.userService.getAll(pageOpts, queryOpts);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch('/:id/toggle-ban/')
  @ResponseMessage('User updated successfully')
  async toggleBan(@Param('id') id: string) {
    return await this.userService.toggleBan(id);
  }
}
