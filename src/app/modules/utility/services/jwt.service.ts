import 'dotenv/config';

import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import config from '../../../../config';
import { BadRequestError, ForbiddenError } from '../../../../shared/utils/error.util';
import * as cache from '../../../../shared/utils/redis.util';
import { generateAlphaNumericString } from '../../../../shared/utils/string.util';
import { CacheKey } from '../../user/constants/auth.constant';
import { AuthTokenResponse, TokenPayload } from '../interfaces/jwt.interface';

export class JWTService {
  static readonly accessTokenExpire = Number(config.application.get('jwt.accessTokenExpiry'));
  static readonly refreshTokenExpire = Number(config.application.get('jwt.refreshTokenExpiry'));

  static signAccessToken(data: TokenPayload): string {
    return jwt.sign({ id: data.id, role: data.role }, config.application.get('jwt.accessTokenSecret'), {
      expiresIn: this.accessTokenExpire,
    });
  }

  static signRefreshToken(data: TokenPayload): string {
    return jwt.sign(
      { id: data.id, role: data.role, ...(data.parentId && { parentId: data.parentId }) },
      config.application.get('jwt.refreshTokenSecret'),
      {
        expiresIn: this.refreshTokenExpire,
      }
    );
  }

  static createSessionTokens(user: TokenPayload, refreshAccessToken: boolean = false): AuthTokenResponse {
    let refreshToken: string;
    const accessToken = this.signAccessToken({ id: user.id, role: user.role });

    if (!refreshAccessToken) {
      const refreshTokenParentId = generateAlphaNumericString(20);

      refreshToken = this.signRefreshToken({
        id: user.id,
        role: user.role,
        parentId: refreshTokenParentId,
      });
      cache.hSet(CacheKey.RefreshToken, [[refreshTokenParentId, refreshToken]]);
    } else {
      refreshToken = '';
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  static verifyToken(token: string, secret: string): TokenPayload | void {
    try {
      return jwt.verify(token, secret) as TokenPayload;
    } catch (err) {
      this.handleTokenError(err);
    }
  }

  static handleTokenError = (error?: JsonWebTokenError) => {
    if (error?.name === 'TokenExpiredError') {
      throw new ForbiddenError('Token has expired, please login again');
    } else if (error?.name === 'JsonWebTokenError') {
      throw new ForbiddenError('Invalid Token');
    }
    throw new BadRequestError(error?.message!);
  };
}
