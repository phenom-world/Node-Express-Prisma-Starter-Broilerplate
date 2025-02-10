import { UserStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';
import { sanitize } from '../../../../shared/utils';

export const getAllUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

class UserValidator {
  validateGetUsersQuery(req: Request, _res: Response, next: NextFunction) {
    const data = req.query;
    const response = getAllUsersQuerySchema.safeParse(data);
    req.query = sanitize(response.data);
    return validate(response, next);
  }
}

export default UserValidator;
