import { Prisma } from '@prisma/client';
import { Handler, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import config from '../../config';

class ErrorHandler {
  static notFound: Handler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route not found ${req.originalUrl}`);
    res.status(StatusCodes.NOT_FOUND);
    next(error);
  };

  static handleError(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    const statusCode = res.statusCode === StatusCodes.OK ? StatusCodes.INTERNAL_SERVER_ERROR : res.statusCode;
    const stack = config.application.get('env') === 'production' ? null : err.stack;

    //  prisma exceptions
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        err.message =
          (err && err.meta && Array.isArray(err.meta.target) ? err.meta.target : []).map((value) => String(value)).join(', ') + ' already exists';
      } else if (err.code === 'P2003') {
        err.message = (err.meta?.field_name as string).split('_')[1] + ' is invalid or has been deleted';
      } else {
        err.message = (err.meta?.cause || err.meta?.target) as string;
      }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      if (err?.message.includes('Invalid value for argument')) {
        const errorMessage = err.message.split('Invalid value for argument')[1].trim()?.split('.')[0];
        err.message = 'Invalid value for' + errorMessage + ' field';
      }
    }

    switch (err.name) {
      case 'BadRequestError':
        res.status(StatusCodes.BAD_REQUEST);
        break;
      case 'UnauthorizedError':
        res.status(StatusCodes.UNAUTHORIZED);
        break;
      case 'ForbiddenError':
        res.status(StatusCodes.FORBIDDEN);
        break;
      case 'NotFoundError':
        res.status(StatusCodes.NOT_FOUND);
        break;
      default:
        res.status(statusCode);
    }

    res.json({
      message: err.message || err,
      stack,
      success: false,
    });
  }
}

export const notFound = ErrorHandler.notFound;
export const ErrorMiddleware = ErrorHandler.handleError;
