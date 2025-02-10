import { User, UserStatus } from '@prisma/client';

import config from '../../../../config';
import { ForbiddenError, UnauthorizedError } from '../../../../shared/utils/error.util';
import * as cache from '../../../../shared/utils/redis.util';
import { generateAlphaNumericString } from '../../../../shared/utils/string.util';
import eventService from '../../utility/services/events.service';
import { CacheKey } from '../constants/auth.constant';

export class AuthHelper {
  validateUserStatus = (user: Pick<User, 'status'>): void => {
    switch (user.status) {
      case UserStatus.UNVERIFIED:
        throw new UnauthorizedError('Account has not been verified, please verify your account to continue');
      case UserStatus.SUSPENDED:
        throw new UnauthorizedError('Account has been suspended, please contact support');
      case UserStatus.DEACTIVATED:
        throw new UnauthorizedError('Account has been deactivated, please contact support');
    }
  };

  sendAccountVerificationEmail = async (user: Partial<User>): Promise<string | undefined> => {
    if (user.status === UserStatus.UNVERIFIED && !user.emailVerifiedAt) {
      const verificationToken = await this.generateEmailVerificationToken(user.email!);

      eventService.emit('email', {
        recipients: [{ email: user.email }],
        action: 'VERIFY_ACCOUNT',
        dynamicData: {
          email: user.email,
          firstName: user.firstName || 'there',
          verificationUrl: `${config.services.get('frontendClient.verifyAccountUrl')}?token=${verificationToken}`,
        },
      });
      return verificationToken;
    }
  };

  sendPasswordResetEmail = async (user: Partial<User>): Promise<string | undefined> => {
    const resetToken = await this.generatePasswordResetToken(user);
    eventService.emit('email', {
      recipients: [{ email: user.email }],
      action: 'RESET_PASSWORD',
      dynamicData: {
        email: user.email,
        firstName: user.firstName || 'there',
        resetPasswordUrl: `${config.services.get('frontendClient.passwordResetUrl')}?token=${resetToken}`,
      },
    });
    return resetToken;
  };

  validateEmailVerificationToken = async (verificationToken: string): Promise<{ email: string }> => {
    const email = await cache.get(`${CacheKey.AccountVerificationToken}${verificationToken}`);
    if (!email) throw new ForbiddenError('Verification token is invalid');
    return { email };
  };

  validatePasswordResetToken = async (resetToken: string): Promise<{ valid: boolean; data?: { email: string } }> => {
    const [token, encodedEmail] = resetToken.split('|');
    if (!token || !encodedEmail) throw new ForbiddenError('Password reset token is invalid');

    const storedToken = await cache.get(`${CacheKey.PasswordResetToken}${encodedEmail}`);

    if (token !== storedToken) throw new ForbiddenError('Password reset token is invalid');
    const email = Buffer.from(encodedEmail, 'base64').toString('ascii');
    return {
      valid: !!email,
      ...(!!email && { data: { email } }),
    };
  };

  private generateEmailVerificationToken = async (email: string): Promise<string> => {
    const verificationToken = `${generateAlphaNumericString(30)}|${Buffer.from(email).toString('base64')}`;
    await cache.set(`${CacheKey.AccountVerificationToken}${verificationToken}`, email, config.application.get('verifyAccountLinkExpiry'));
    return verificationToken;
  };

  private generatePasswordResetToken = async (user: Partial<User>): Promise<string> => {
    const resetToken = generateAlphaNumericString(30);
    const encodedEmail = Buffer.from(user.email!).toString('base64');
    const expiry = config.application.get('resetPasswordTokenExpiry');

    await cache.set(`${CacheKey.PasswordResetToken}${encodedEmail}`, resetToken, expiry);
    return `${resetToken}|${encodedEmail}`;
  };
}
