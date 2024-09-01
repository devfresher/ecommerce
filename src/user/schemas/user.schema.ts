import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { DocumentWithTimestamps, Role } from 'src/common/typings/core';

export type UserDocument = DocumentWithTimestamps<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ unique: true, required: true, index: true })
  email!: string;

  @Exclude()
  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'user', enum: Role, index: true })
  role!: Role;

  @Prop({ default: false, index: true })
  isBanned!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
