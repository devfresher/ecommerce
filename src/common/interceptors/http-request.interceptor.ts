import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { Role, SortOrder } from '../typings/core';
import { ApprovalStatus } from 'src/product/product.enum';

@Injectable()
export class RequestQueryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const {
      query: { limit, page, sortOrder, search, status, approvalStatus, role, userId, isBanned },
    } = request;

    request.pageOpts = {
      limit: Number(limit) ? Number(limit) : 15,
      page: Number(page) ? Number(page) : 1,
    };

    request.queryOpts = {
      approvalStatus: ApprovalStatus[approvalStatus as keyof typeof ApprovalStatus]
        ? approvalStatus
        : undefined,
      role: Role[role as keyof typeof Role] ? role : undefined,
      isBanned: isBanned ? isBanned == 'true' : undefined,
      sortOrder: sortOrder != 'asc' ? SortOrder.desc : SortOrder.asc,
      search: search ? search : undefined,
      status: status ? status : undefined,
      userId: userId ? userId : undefined,
    };

    return next.handle().pipe(tap(() => {}));
  }
}
