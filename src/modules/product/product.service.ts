import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BaseService } from 'src/common/services/base.service';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto, UpdateStatusDto } from './product.dto';
import { ApprovalStatus } from './product.enum';

@Injectable()
export class ProductService extends BaseService<Product, ProductDocument> {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {
    super(productModel, Product, 'Product');
  }

  defaultRelations = [this.generateRelation('user')];

  async create(userId: string, createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel({
      ...createProductDto,
      user: userId,
    });

    return await product.save();
  }

  async update(
    userId: string,
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productModel.findOneAndUpdate(
      { _id: productId, user: userId },
      updateProductDto,
      { new: true },
    );

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async delete(userId: string, productId: string): Promise<Product> {
    const product = await this.productModel.findOneAndDelete({ _id: productId, user: userId });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateStatus(adminId: string, productId: string, data: UpdateStatusDto): Promise<Product> {
    const session = await this.productModel.startSession();
    session.startTransaction();
    try {
      const { status, reason } = data;
      const product = await this.getOrError({ filter: { _id: productId } }, session);

      if (product.approvalStatus === status)
        throw new ConflictException(`Product already ${status}`);

      if (product.approvalStatus === ApprovalStatus.APPROVED && status === ApprovalStatus.REJECTED)
        throw new ConflictException('Product cannot be rejected');

      if (product.approvalStatus === ApprovalStatus.REJECTED && status === ApprovalStatus.APPROVED)
        throw new ConflictException('Product cannot be approved');

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
}
