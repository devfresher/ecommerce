import { Types } from 'mongoose';
import { FilterQuery, PopulateOptions, ProjectionType } from 'mongoose';

export interface PageOptions {
  limit?: number;
  page?: number;
}

export interface QueryOptions {
  search?: string;
  status?: string;
  sortOrder?: SortOrder;
}

export enum SortOrder {
  asc = 'ASC',
  desc = 'DESC',
}

export interface FindAllOption<T> {
  pageOpts?: PageOptions;
  sort?: { [key in keyof T]: SortOrder };
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

