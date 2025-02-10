import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../../../shared/helpers/validation.helper';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  middleName: z.string().optional(),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
});

export const setPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters' }),
});

class AuthValidator {
  validateLogin(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = loginSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateRegister(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = registerSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateVerifyAccountRequestBody(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = z
      .object({
        token: z.string().min(1, { message: 'Verification token is required' }),
      })
      .safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateRefreshTokenRequestBody(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = z
      .object({
        refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
      })
      .safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateEmail(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = z
      .object({
        email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
      })
      .safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateToken(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = z
      .object({
        token: z.string().min(40, { message: 'Token is required' }),
      })
      .safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateSetPassword(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = setPasswordSchema.safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }

  validateChangePasswordBody(req: Request, _res: Response, next: NextFunction) {
    const data = req.body;
    const response = z
      .object({
        password: z.string().min(5, { message: 'Password must be at least 5 characters' }),
      })
      .safeParse(data);
    req.body = response.data;
    return validate(response, next);
  }
}

export default AuthValidator;
