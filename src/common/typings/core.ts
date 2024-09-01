import { HydratedDocument, Types } from 'mongoose';
import { FilterQuery, PopulateOptions, ProjectionType } from 'mongoose';

export interface PageOptions {
  limit?: number;
  page?: number;
}

export interface QueryOptions {
  search?: string;
  status?: string;
  sortOrder?: SortOrder;
  approvalStatus?: string;
  role?: Role;
  isBanned?: boolean;
  userId?: string;
}

export enum SortOrder {
  asc = 1,
  desc = -1,
}

export enum Role {
  user = 'user',
  admin = 'admin',
}

export interface FindAllOption<T> {
  pageOpts?: PageOptions;
  sort?: { [K in keyof T]?: SortOrder };
  filter?: FilterQuery<T>;
  fields?: ProjectionType<T>;
  relations?: PopulateOptions[];
}

export interface RelationOptions<T> {
  filter?: FilterQuery<T>;
  fields?: ProjectionType<T>;
  relations?: PopulateOptions[];
}

export type Id = Types.ObjectId | string;

export type DocumentWithTimestamps<T> = HydratedDocument<T> & {
  createdAt: Date;
  updatedAt: Date;
};
