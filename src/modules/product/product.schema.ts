import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';
import { ApprovalStatus } from './product.enum';
import { DocumentWithTimestamps, Id } from 'src/common/typings/core';
import { UtilsHelper } from 'src/common/helpers/utils.helper';
import { BadRequestException } from '@nestjs/common';

export type ProductDocument = DocumentWithTimestamps<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true, enum: ApprovalStatus, default: ApprovalStatus.Pending })
  approvalStatus!: ApprovalStatus;

  // Field to store the admin who approved/rejected the product
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  actionBy?: User | Id;

  // Field to capture the reason for approval or rejection
  @Prop({ type: String, required: false })
  actionReason?: string;

  // Field to store the date when the product was last approved or rejected
  @Prop({ type: Date, required: false })
  actedUponAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user!: User | Id;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
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
