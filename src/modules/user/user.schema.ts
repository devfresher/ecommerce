import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ unique: true, required: true })
  email!: string;

  @Exclude()
  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'user' })
  role!: 'user' | 'admin';

  @Prop({ default: false })
  isBanned!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
