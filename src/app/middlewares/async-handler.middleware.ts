import { Handler, NextFunction, Request, Response } from 'express';

class AsyncHandler {
  static handler(theFunc: Handler): Handler {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(theFunc(req, res, next)).catch(next);
    };
  }
}

export const asyncHandler = AsyncHandler.handler;
