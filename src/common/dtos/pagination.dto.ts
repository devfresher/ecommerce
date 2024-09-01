export class PaginatedResultDto<T> {
  items!: T[];
  pagination!: PaginationMetadata;
}

export class PaginationMetadata {
  totalItems!: number;
  itemsPerPage!: number;
  currentPage!: number;
  totalPages!: number;
}
