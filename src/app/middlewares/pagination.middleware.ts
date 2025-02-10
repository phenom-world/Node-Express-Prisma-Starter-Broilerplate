import { NextFunction, Request, Response } from 'express';

import { isObject } from '../../shared/utils';
import { InternalServerError } from '../../shared/utils/error.util';
import { ObjectData } from '../../types';
import { asyncHandler } from './async-handler.middleware';

class PaginationMiddleware {
  paginate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maxLimit = 100;
      req.query.page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10).toString() || '1' : '1';
      req.query.limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10).toString() || '0' : '10';

      if (+req.query.limit > maxLimit) {
        req.query.limit = maxLimit.toString();
      }

      if (+req.query.page < 1) {
        req.query.page = '1';
      }

      if (+req.query.limit < 1) {
        req.query.limit = '0';
      }

      const offset = +req.query.page * +req.query.limit - +req.query.limit;

      res.locals.paginate = {
        offset,
        skip: offset,
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        href: this.href(req),
        hasNextPages: this.hasNextPages(req),
        getArrayPages: this.getArrayPages(req),
        hasPreviousPages: +req.query.page > 1,
      };

      next();
    } catch (error) {
      next(error);
    }
  });

  private hasNextPages(req: Request): (pageCount: number) => boolean {
    return (pageCount: number): boolean => {
      const count = Number(pageCount || 0);
      if (typeof count !== 'number' || count < 0) {
        throw new InternalServerError('paginate middleware: `pageCount` must be a number >= 0');
      }
      return +(req.query.page || 1) < count;
    };
  }

  private href(req: Request): (prev?: boolean, params?: ObjectData) => string {
    return (prev?: boolean, params?: ObjectData): string => {
      let query = { ...(req.query as ObjectData) };
      if (typeof prev === 'object') {
        params = prev;
        prev = false;
      } else {
        prev = typeof prev === 'boolean' ? prev : false;
        query.page = parseInt(query.page, 10);
        query.page = prev ? (query.page -= 1) : (query.page += 1);
        query.page = query.page < 1 ? 1 : query.page;
      }

      if (isObject(params)) {
        query = { ...query, ...params };
      }
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      return new URL(fullUrl) + '?' + new URLSearchParams(query);
    };
  }

  private getArrayPages(req: Request): (limit: number, pageCount: number, currentPage: number) => { number: number; url: string }[] | undefined {
    return (limit: number, pageCount: number, currentPage: number): { number: number; url: string }[] | undefined => {
      limit = Number(limit || 3);
      pageCount = Number(pageCount || 0);

      if (typeof limit !== 'number' || limit < 0) {
        throw new InternalServerError('paginate middleware: `limit` is not a number >= 0');
      }

      if (typeof pageCount !== 'number' || pageCount < 0) {
        throw new InternalServerError('paginate middleware: `pageCount` is not a number >= 0');
      }

      currentPage = parseInt(currentPage.toString(), 10);

      if (Number.isNaN(currentPage) || currentPage < 0) {
        throw new InternalServerError('paginate middleware: `currentPage` is not a number >= 0');
      }

      if (limit > 0) {
        const end = Math.min(Math.max(currentPage + Math.floor(limit / 2), limit), pageCount);
        const start = Math.max(1, currentPage < limit - 1 ? 1 : end - limit + 1);

        const pages = [];
        for (let i = start; i <= end; i++) {
          pages.push({
            number: i,
            url: this.href(req)().replace('page=' + (currentPage + 1), 'page=' + i),
          });
        }

        return pages;
      }
    };
  }
}

export default PaginationMiddleware;
