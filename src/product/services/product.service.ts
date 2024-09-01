import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BaseService } from 'src/common/services/base.service';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { CreateProductDto, UpdateProductDto, UpdateStatusDto } from '../dtos/product.dto';
import { ApprovalStatus } from '../product.enum';
import { FindAllOption, PageOptions, QueryOptions } from 'src/common/typings/core';
import { UtilsHelper } from 'src/common/helpers/utils.helper';
import { PaginatedResultDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductService extends BaseService<Product, ProductDocument> {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {
    super(productModel, Product, 'Product');
  }

  defaultRelations = [this.generateRelation('user', { fields: { password: 0 } })];

  /**
   * Retrieves all products that match the given filter conditions.
   *
   * @param pageOpts Options for pagination.
   * @param queryOpts Options for filtering the results.
   * @returns A list of products, or a paginated result if pagination options are provided.
   */
  async getAll(
    pageOpts: PageOptions,
    queryOpts: QueryOptions,
  ): Promise<Product[] | PaginatedResultDto<Product>> {
    const options: FindAllOption<ProductDocument> = {
      pageOpts,
      relations: this.defaultRelations,
      sort: { createdAt: queryOpts.sortOrder },
      ...(queryOpts.approvalStatus && { filter: { approvalStatus: queryOpts.approvalStatus } }),
      ...(queryOpts.userId && { filter: { user: queryOpts.userId } }),
    };

    if (queryOpts.search) {
      options.filter = {
        $or: [
          { name: { $regex: queryOpts.search, $options: 'i' } },
          { description: { $regex: queryOpts.search, $options: 'i' } },
        ],
      };
    }

    return await this.getAllForService(options);
  }

  async create(userId: string, createProductDto: CreateProductDto): Promise<Product> {
    const { name } = createProductDto;
    const label = await this.generateAndCheckLabel(name);

    const product = new this.productModel({
      ...createProductDto,
      label,
      user: userId,
    });

    return await product.save();
  }

  /**
   * Updates a product that belongs to the given user.
   * Any updated product has it approval status set to Pending.
   *
   * @param userId The ID of the user who owns the product.
   * @param productId The ID of the product to update.
   * @param updateProductDto The data to update the product with.
   * @returns The updated product.
   */
  async update(
    userId: string,
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const session = await this.productModel.startSession();
    session.startTransaction();
    try {
      const product = await this.getOrError({ filter: { _id: productId, user: userId } }, session);
      Object.assign(product, updateProductDto);
      product.approvalStatus = ApprovalStatus.Pending;

      await product.save({ session });
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async delete(userId: string, productId: string): Promise<Product> {
    const product = await this.productModel.findOneAndDelete({ _id: productId, user: userId });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /**
   * Updates the approval status of a product.
   * The approval status can be changed from Pending to Approved or Rejected,
   * If the product is already in the desired status, a ConflictException is thrown.
   *
   * @param adminId The ID of the administrator who is updating the product.
   * @param productId The ID of the product to update.
   * @param data The data to update the product with.
   * @returns The updated product.
   */
  async updateStatus(adminId: string, productId: string, data: UpdateStatusDto): Promise<Product> {
    const session = await this.productModel.startSession();
    session.startTransaction();
    try {
      const { status, reason } = data;
      const product = await this.getOrError({ filter: { _id: productId } }, session);

      if (product.approvalStatus === status)
        throw new ConflictException(`Product already ${status.toLowerCase()}`);

      if (product.approvalStatus === ApprovalStatus.Approved && status === ApprovalStatus.Rejected)
        throw new ConflictException('Product already approved and cannot be rejected');

      if (product.approvalStatus === ApprovalStatus.Rejected && status === ApprovalStatus.Approved)
        throw new ConflictException('Product already rejected and cannot be approved');

      product.approvalStatus = status;
      product.actionBy = new mongoose.Types.ObjectId(adminId);
      product.actedUponAt = new Date();
      product.actionReason = reason;

      await product.save({ session });
      await session.commitTransaction();

      return product;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Generates a label from a given name and checks if a product with this label
   * already exists in the database.
   *
   * @param name - The input name to convert.
   * @returns The generated label string if no product with this label exists.
   * @throws ConflictException if a product with this label already exists.
   */
  private async generateAndCheckLabel(name: string) {
    const label = UtilsHelper.getLabel(name);

    const product = await this.get({ filter: { label } });
    if (product) throw new ConflictException('Product with this name already exists');

    return label;
  }
}
