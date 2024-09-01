import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  Delete,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './services/product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto, UpdateStatusDto } from './dtos/product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { PageOptions, QueryOptions, Role } from 'src/common/typings/core';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CustomQuery } from 'src/common/decorators/query-options.decorator';
import { Page } from 'src/common/decorators/page-options.decorator';
import { ProductCacheInterceptor } from './interceptors/cache.interceptor';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
@UseInterceptors(ProductCacheInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Creates a new product.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.user)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product created successfully')
  async create(
    @AuthenticatedUser() user: UserDocument,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.create(user.id, createProductDto);
  }

  /**
   * Retrieves a list of products, or a paginated result if pagination options are provided.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Products fetched successfully')
  async findAll(@CustomQuery() query: QueryOptions, @Page() page: PageOptions) {
    return this.productService.getAll(page, query);
  }

  /**
   * Retrieves a list of products that belong to the currently authenticated user.
   * Supports pagination and filtering.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.user)
  @Get('mine')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('My products fetched successfully')
  async findMine(
    @AuthenticatedUser() user: UserDocument,
    @CustomQuery() query: QueryOptions,
    @Page() page: PageOptions,
  ) {
    query.userId = user.id;
    return this.productService.getAll(page, query);
  }

  /**
   * Retrieves a list of approved products, or a paginated result if pagination options are provided.
   * Supports pagination and filtering.
   */
  @Get('approved')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Approved products fetched successfully')
  async findApproved(@CustomQuery() query: QueryOptions, @Page() page: PageOptions) {
    query.approvalStatus = 'Approved';
    return this.productService.getAll(page, query);
  }

  /**
   * Updates a product that belongs to the currently authenticated user.
   * The product to update is identified by the `:id` parameter.
   * If the product is not found, a `NotFoundException` is thrown.
   * If the product is successfully updated, returns the updated product.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.user)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product updated successfully')
  @Put(':id')
  async update(
    @AuthenticatedUser() user: UserDocument,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(user.id, id, updateProductDto);
  }

  /**
   * Deletes a product that belongs to the currently authenticated user.
   * The product to delete is identified by the `:id` parameter.
   * If the product is not found, a `NotFoundException` is thrown.
   * If the product is successfully deleted, returns the deleted product.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.user)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product deleted successfully')
  async remove(@AuthenticatedUser() user: UserDocument, @Param('id') id: string) {
    return this.productService.delete(user.id, id);
  }

  /**
   * Updates the approval status of a product as an administrator.
   * The product to update is identified by the `:id` parameter.
   * If the product is not found, a `NotFoundException` is thrown.
   * If the product is successfully updated, returns the updated product.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch('action/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product updated successfully')
  async adminAction(
    @AuthenticatedUser() admin: UserDocument,
    @Param('id') id: string,
    @Body() data: UpdateStatusDto,
  ) {
    return this.productService.updateStatus(admin.id, id, data);
  }
}
