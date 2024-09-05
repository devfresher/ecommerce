import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { DocumentWithTimestamps, Id } from 'src/common/typings/core';
import { UtilsHelper } from 'src/common/helpers/utils.helper';
import { BadRequestException } from '@nestjs/common';
import { ApprovalStatus } from 'src/product/product.enum';
import { User } from 'src/user/schemas/user.schema';

export type ProductDocument = DocumentWithTimestamps<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true, index: true })
  label!: string;

  @Prop({ required: true, index: true })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true, enum: ApprovalStatus, default: ApprovalStatus.Pending, index: true })
  approvalStatus!: ApprovalStatus;

  // Field that captures the admin who approved or rejected the product
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  actionBy?: User | Id;

  // Field that captures the reason for the admin action
  @Prop({ type: String, required: false })
  actionReason?: string;

  // Field that stores the date when the admin approved or rejected the product
  @Prop({ type: Date, required: false })
  actedUponAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user!: User | Id;

  createdAt!: Date;

  updatedAt!: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Configure composite indexes
ProductSchema.index({ label: 1, user: 1 }, { unique: true });

ProductSchema.pre<ProductDocument>('save', async function (next) {
  const productModel = this.constructor as Model<ProductDocument>;

  try {
    if (this.isModified('name')) {
      const label = UtilsHelper.getLabel(this.name);

      const existingProduct = await productModel.findOne({ label, user: this.user });

      if (existingProduct) {
        throw new BadRequestException('Product with this name already exists');
      }

      this.label = label;
    }

    next();
  } catch (err: any) {
    next(err);
  }
});
