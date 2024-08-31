import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { ApprovalStatus } from './product.enum';
import { Id } from 'src/common/typings/core';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true, enum: ApprovalStatus, default: ApprovalStatus.PENDING })
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
