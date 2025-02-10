import { Role, User, UserStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import prisma from '../../../prisma';
import config from '../../config';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../../shared/utils/error.util';
import { TokenPayload } from '../modules/utility/interfaces/jwt.interface';
import { JWTService } from '../modules/utility/services/jwt.service';
import { asyncHandler } from './async-handler.middleware';

interface IAuthMiddleware {
  isAuthenticated: (req: Request, res: Response, next: NextFunction) => void;
  authorizeRoles: (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
}

class AuthMiddleware implements IAuthMiddleware {
  isAuthenticated = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const token = this.getToken(req);
    if (!token) {
      throw new ForbiddenError('Authorization token is required');
    }
    try {
      const decoded = JWTService.verifyToken(token, config.application.get('jwt.accessTokenSecret')) as TokenPayload;

      if (!decoded.id) {
        throw new UnauthorizedError('Unauthorized to access this route');
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        throw new UnauthorizedError('Unauthorized to access this route');
      }

      if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedError('User account is not active');
      req.user = this.getUser(user);
      next();
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });

  authorizeRoles = (...roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!roles.includes(req.user?.role || '')) {
        throw new ForbiddenError(`${req.user?.role} is not allowed to access this route`);
      }
      next();
    };
  };

  private getToken(req: Request): string | null {
    const authorization = req.headers.authorization;
    const authToken = req.cookies.authToken;

    if (!authorization && !authToken) {
      return null;
    }
    if (authorization && authorization.startsWith('Bearer')) {
      return authorization.split(' ')[1];
    }
    return authToken;
  }

  private getUser(user: Pick<User, 'id' | 'email' | 'role' | 'status'>) {
    return { id: user.id, email: user.email, role: user.role, status: user.status };
  }
}

export default new AuthMiddleware();
