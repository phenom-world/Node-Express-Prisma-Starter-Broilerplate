import config from '../../../../config';
import { CookieOptions } from '../interfaces/auth.interface';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.application.get('env') === 'production',
  path: '/',
};

export enum CacheKey {
  PasswordResetToken = 'USER:RESET_PASSWORD_TOKEN:',
  AccountVerificationToken = 'USER:ACCOUNT_VERIFICATION_TOKEN:',
  RefreshToken = 'USER:REFRESH_TOKEN:',
}
