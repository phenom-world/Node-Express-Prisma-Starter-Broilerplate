import { User } from '@prisma/client';

import { InferSchema } from '../../../../types';
import { loginSchema, registerSchema, setPasswordSchema } from '../validations/auth.validation';

export type CookieOptions = {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none' | undefined;
  secure: boolean;
  path: string;
  maxAge?: number;
};

export interface RegisterDto extends InferSchema<typeof registerSchema> {}
export interface LoginDto extends InferSchema<typeof loginSchema> {}
export interface SetPasswordDto extends InferSchema<typeof setPasswordSchema> {}

export type LoginResponse = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role'> & {
  accessToken: string;
  refreshToken: string;
  isVerified?: boolean;
};

export type UserResponse = Omit<User, 'password'>;
