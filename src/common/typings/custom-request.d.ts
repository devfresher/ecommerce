declare namespace Express {
  export interface Request {
    pageOpts?: PageOptions;
    queryOpts?: QueryOptions;
    user?: User;
  }
}
