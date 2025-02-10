import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../../../../shared/utils';
import { CustomRequest } from '../../../../types';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { JWTService } from '../../utility/services/jwt.service';
import { cookieOptions } from '../constants/auth.constant';
import { LoginDto, RegisterDto, SetPasswordDto } from '../interfaces/auth.interface';
import AuthService from '../services/auth.service';

class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Register a new user
  registerUser = asyncHandler(async (req: CustomRequest<RegisterDto>, res: Response) => {
    const userData = req.body;
    const response = await this.authService.registerUser(userData);

    return ApiResponse(res, StatusCodes.CREATED, response, 'Account created successfully');
  });

  // Verify a user's account
  verifyAccount = asyncHandler(async (req: CustomRequest<{ token: string }>, res: Response) => {
    const data = await this.authService.verifyAccount(req.body.token);
    return ApiResponse(res, StatusCodes.OK, data, 'Account verification successful');
  });

  // Login a user
  loginUser = asyncHandler(async (req: CustomRequest<LoginDto>, res: Response) => {
    const response = await this.authService.loginUser(req.body);
    if (!response.isVerified) {
      return ApiResponse(res, StatusCodes.OK, response, 'Please check your email to verify your account');
    }
    this.setAuthCookies(res, response?.accessToken!, response?.refreshToken!);
    return ApiResponse(res, StatusCodes.OK, response);
  });

  sendConfirmationEmail = asyncHandler(async (req: CustomRequest<{ email: string }>, res: Response) => {
    const { email } = req.body;
    const response = await this.authService.sendConfirmationEmail(email);
    return ApiResponse(res, StatusCodes.OK, response, 'Verification email sent successfully');
  });

  // Logout a user
  logoutUser = async (_req: Request, res: Response) => {
    this.clearAuthCookies(res);
    return ApiResponse(res, StatusCodes.OK, null, 'Logged out successfully');
  };

  // Change a user's password
  changePassword = asyncHandler(async (req: CustomRequest<{ password: string }>, res: Response) => {
    await this.authService.changePassword(req.user.id, req.body.password);
    return ApiResponse(res, StatusCodes.OK, null, 'Password changed successfully');
  });

  // Initiate a password reset
  initiatePasswordReset = asyncHandler(async (req: CustomRequest<{ email: string }>, res: Response) => {
    const response = await this.authService.initiatePasswordReset(req.body.email);
    return ApiResponse(res, StatusCodes.OK, response, 'An email would be sent shortly if email is registered');
  });

  // Validate a password reset token
  validatePasswordResetToken = asyncHandler(async (req: CustomRequest<{ token: string }>, res: Response) => {
    const result = await this.authService.validatePasswordResetToken(req.body.token);
    return ApiResponse(res, StatusCodes.OK, result, 'Password reset token is valid');
  });

  // Complete a password reset
  setPassword = asyncHandler(async (req: CustomRequest<SetPasswordDto>, res: Response) => {
    const result = await this.authService.setPassword(req.body.token, req.body.password);
    return ApiResponse(res, StatusCodes.OK, result, 'Password reset complete. Please login with your new password');
  });

  // Refresh a user's access token
  refreshToken = asyncHandler(async (req: CustomRequest<{ refreshToken: string }>, res: Response) => {
    const refresh = req.body.refreshToken;
    const { accessToken, refreshToken } = await this.authService.refreshAccessToken(refresh, () => this.clearAuthCookies(res));
    this.setAuthCookies(res, accessToken, refreshToken);
    return ApiResponse(res, StatusCodes.OK, { accessToken }, 'Token refreshed successfully');
  });

  // Set authentication cookies
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: JWTService.accessTokenExpire,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: JWTService.refreshTokenExpire,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}

export default AuthController;
