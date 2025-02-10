import { Prisma, Role, User, UserStatus } from '@prisma/client';

import prisma from '../../../../../prisma';
import config from '../../../../config';
import { exclude } from '../../../../shared/utils';
import { Repository } from '../../../../shared/utils/data-repo.util';
import encrypterUtil from '../../../../shared/utils/encrypter.util';
import { BadRequestError, ForbiddenError } from '../../../../shared/utils/error.util';
import * as cache from '../../../../shared/utils/redis.util';
import { TokenPayload } from '../../utility/interfaces/jwt.interface';
import { JWTService } from '../../utility/services/jwt.service';
import { CacheKey } from '../constants/auth.constant';
import { AuthHelper } from '../helpers/auth.helper';
import { LoginDto, LoginResponse, RegisterDto } from '../interfaces/auth.interface';

class AuthService {
  private readonly authHelper: AuthHelper;
  private readonly repo: Repository<typeof Prisma.ModelName.User>;

  constructor() {
    this.authHelper = new AuthHelper();
    this.repo = new Repository(prisma, 'user');
  }

  // Register a new user
  async registerUser(userData: RegisterDto) {
    await this.repo.findOneAndThrow({ where: { email: userData.email } });
    const hashedPassword = await encrypterUtil.hash(userData.password);
    const user = await this.repo.create<User>({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
    const verificationToken = await this.authHelper.sendAccountVerificationEmail(user);
    return {
      ...user,
      token: config.application.get('env') === 'development' ? verificationToken : undefined,
    };
  }

  // Login a user
  async loginUser(userData: LoginDto): Promise<Partial<LoginResponse>> {
    const user = await this.repo.findOneOrThrow<User>(
      {
        where: { email: userData.email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          password: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
        },
      },
      'Invalid email or password'
    );

    const isPasswordValid = await encrypterUtil.compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid email or password');
    }
    if (user.status === UserStatus.UNVERIFIED) {
      // Send account verification email
      await this.authHelper.sendAccountVerificationEmail(user);
      return { isVerified: false };
    }

    this.authHelper.validateUserStatus(user);
    const { accessToken, refreshToken } = JWTService.createSessionTokens({
      id: user.id,
      role: user.role,
    });

    await this.repo.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const userWithoutPassword = exclude(user, ['password']);

    return {
      ...userWithoutPassword,
      accessToken,
      refreshToken,
      isVerified: user.emailVerifiedAt ? true : false,
    };
  }

  // Verify a user's account
  async verifyAccount(verificationToken: string): Promise<LoginResponse> {
    const { email } = await this.authHelper.validateEmailVerificationToken(verificationToken);
    const user = await this.repo.findOne<User>({ where: { email } });

    if (!user || user.status !== UserStatus.UNVERIFIED) throw new ForbiddenError('Verification token is invalid');

    const updatedUser = await this.repo.update({ where: { email }, data: { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() } });
    cache.del(`${CacheKey.AccountVerificationToken}${verificationToken}`);

    const { accessToken, refreshToken } = JWTService.createSessionTokens({
      id: user.id,
      role: user.role,
    });

    return {
      ...updatedUser,
      accessToken,
      refreshToken,
    };
  }

  sendConfirmationEmail = async (email: string): Promise<{ token: string | undefined }> => {
    const user = await this.repo.findOne({ where: { email } });
    if (!user || user.status !== UserStatus.UNVERIFIED) throw new BadRequestError('verification request failed');
    const verificationToken = await this.authHelper.sendAccountVerificationEmail(user as Partial<User>);
    return {
      token: config.application.get('env') === 'development' ? verificationToken : undefined,
    };
  };

  // Change a user's password
  async changePassword(id: string, password: string): Promise<void> {
    const hashedPassword = await encrypterUtil.hash(password);
    await this.repo.update({ where: { id }, data: { password: hashedPassword } });
  }

  // Initiate a password reset
  async initiatePasswordReset(email: string): Promise<{ token: string | undefined }> {
    const user = await this.repo.findOneOrThrow<User>({ where: { email }, select: { id: true, email: true, firstName: true } });
    const verificationToken = await this.authHelper.sendPasswordResetEmail(user);
    return {
      token: config.application.get('env') === 'development' ? verificationToken : undefined,
    };
  }

  // Validate a password reset token
  async validatePasswordResetToken(resetToken: string): Promise<{ valid: boolean }> {
    const { valid, data } = await this.authHelper.validatePasswordResetToken(resetToken);

    if (!valid || !data?.email) throw new ForbiddenError('Password reset token is invalid');

    const user = await this.repo.findOne<User>({ where: { email: data.email }, select: { id: true } });
    if (!user) throw new ForbiddenError('Password reset token is invalid');

    return { valid: true };
  }

  // Complete a password reset
  async setPassword(resetToken: string, newPassword: string): Promise<{ completed: boolean }> {
    const { valid, data } = await this.authHelper.validatePasswordResetToken(resetToken);
    const [, encodedEmail] = resetToken.split('|');

    if (!valid || !data?.email) throw new ForbiddenError('Password reset token is invalid');
    const user = await this.repo.findOneOrThrow<User>({ where: { email: data.email }, select: { id: true } }, 'Password reset token is invalid');
    const passwordHash = await encrypterUtil.hash(newPassword);
    await this.repo.update({ where: { id: user.id }, data: { password: passwordHash } });

    cache.del(`${CacheKey.PasswordResetToken}${encodedEmail}`);

    return { completed: true };
  }

  // Refresh a user's access token
  refreshAccessToken = async (refreshToken: string, clearCookie: () => void) => {
    const payload = JWTService.verifyToken(refreshToken, config.application.get('jwt.refreshTokenSecret')) as TokenPayload;
    if (!payload) throw new ForbiddenError('Invalid refresh token');
    const tokenRecord = await cache.hGet(CacheKey.RefreshToken, payload.parentId);

    if (!tokenRecord || tokenRecord !== refreshToken) {
      if (tokenRecord) {
        cache.hDel(CacheKey.RefreshToken, payload.parentId);
      }
      clearCookie();
      throw new ForbiddenError('Refresh token is invalid');
    }

    const user = await this.repo.findById<User>(payload.id);

    if (!user) {
      clearCookie();
      throw new ForbiddenError('Refresh token is invalid');
    }

    this.authHelper.validateUserStatus(user);
    const { accessToken } = JWTService.createSessionTokens(
      {
        id: user.id,
        role: user.role as Role,
      },
      true
    );

    return { accessToken, refreshToken };
  };
}

export default AuthService;
