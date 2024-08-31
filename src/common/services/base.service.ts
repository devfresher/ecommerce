import { ClassConstructor } from 'class-transformer';
import { DocumentWithTimestamps, FindAllOption, RelationOptions } from '../typings/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientSession, FilterQuery, Model, PopulateOptions } from 'mongoose';
import { PaginatedResult, PaginationMetadata } from '../typings/paginate';

@Injectable()
export abstract class BaseService<T, D extends DocumentWithTimestamps<T>> {
  /**
   * Constructor for the BaseService.
   *
   * @param model The mongoose model for the entity.
   * @param entity The class constructor for the entity.
   * @param entityName The name of the entity, used for error messages.
   */
  constructor(
    private readonly model: Model<D>,
    private readonly entity: ClassConstructor<T>,
    private readonly entityName: string = 'Resource',
  ) {}

  /**
   * Retrieves all documents that match the given filter conditions.
   *
   * @param opts Options for retrieving the documents.
   * @param session The client session to use when retrieving the documents.
   * @returns A list of documents, or a paginated result if pagination options are provided.
   */
  protected async getAllForService(
    opts?: FindAllOption<D>,
    session?: ClientSession,
  ): Promise<T[] | PaginatedResult<T>> {
    const page = opts?.pageOpts ? opts?.pageOpts?.page : 1;
    const limit = opts?.pageOpts ? opts?.pageOpts?.limit : 15;

    let items = await this.model.find(opts?.filter || {}, opts?.fields, {
      ...(page && limit && { limit, skip: (page - 1) * limit }),
      populate: opts?.relations,
      sort: opts?.sort,
      session,
    });

    if (!(page && limit)) {
      return items;
    } else {
      const totalCount = await this.model.countDocuments(opts?.filter || {});
      const pagination = this.paginate(totalCount, page, limit);
      return { items, pagination };
    }
  }

  /**
   * Counts the number of documents that match the given filter conditions.
   *
   * @param filter Filter conditions to apply.
   * @param session The client session to use when retrieving the documents.
   * @returns The number of documents that match the conditions.
   */
  async countAll(filter?: FilterQuery<D>, session?: ClientSession): Promise<number> {
    return this.model.countDocuments(filter, { session });
  }

  /**
   * Retrieves a single document that matches the given filter conditions,
   * or throws a `NotFoundException` if no document is found.
   *
   * @param opts Options for retrieving the document.
   * @param session The client session to use when retrieving the document.
   * @returns The retrieved document.
   * @throws NotFoundException If no document is found.
   */
  async getOrError(opts?: FindAllOption<D>, session?: ClientSession): Promise<D> {
    const entity = await this.get(opts, session);

    if (!entity)
      throw new NotFoundException(
        `This ${this.entityName.toLowerCase()} record could not be found`,
      );

    return entity;
  }

  /**
   * Retrieves a single document that matches the given filter conditions.
   *
   * @param opts Options for retrieving the document.
   * @param session The client session to use when retrieving the document.
   * @returns The retrieved document, or null if no document is found.
   */
  async get(opts?: FindAllOption<D>, session?: ClientSession): Promise<D | null> {
    return this.model.findOne(opts?.filter || {}, opts?.fields, {
      populate: opts?.relations,
      session,
    });
  }

  /**
   * Generates a populate option for a relation.
   *
   * @param path The path of the relation.
   * @param options The options for the relation.
   * @returns The generated populate option.
   */
  protected generateRelation<U>(
    path: string,
    { fields, relations, filter }: RelationOptions<U> = {},
  ): PopulateOptions {
    return {
      path,
      select: fields,
      populate: relations,
      match: filter,
    };
  }

  /**
   * Creates a PaginationMetadata instance based on the given pagination parameters.
   *
   * @param totalItems The total number of items.
   * @param page The current page number.
   * @param limit The limit of items per page.
   * @returns A PaginationMetadata object with the total items, items per page, current page, and total pages.
   */
  private paginate(totalItems: number, page: number, limit: number): PaginationMetadata {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    const itemsPerPage = limit;

    return { totalItems, itemsPerPage, currentPage, totalPages };
  }
}
