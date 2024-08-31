import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { SortOrder } from '../typings/core';

@Injectable()
export class FormatRequestQueryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const {
      query: { limit, page, sortOrder, search, status },
    } = request;

    request.pageOpts = {
      limit: Number(limit) ? Number(limit) : 15,
      page: Number(page) ? Number(page) : 1,
    };

    request.queryOpts = {
      sortOrder: sortOrder != 'asc' ? SortOrder.desc : SortOrder.asc,
      search: search ? search : undefined,
      status: status ? status : undefined,
    };

    return next.handle().pipe(tap(() => {}));
  }
}
