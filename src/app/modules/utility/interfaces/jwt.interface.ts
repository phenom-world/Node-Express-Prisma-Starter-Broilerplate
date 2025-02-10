import { Role } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

export type AuthTokenResponse = JwtPayload & {
  accessToken: string;
  refreshToken: string;
  id?: string;
  role?: string;
};

export type TokenPayload = JwtPayload & {
  id: string;
  role: Role;
};
