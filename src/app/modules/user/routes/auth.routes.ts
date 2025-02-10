import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import AuthController from '../controllers/auth.controller';
import AuthValidator from '../validations/auth.validation';

class AuthRouter {
  private authController: AuthController;
  private authValidator: AuthValidator;
  private router: Router;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authValidator = new AuthValidator();

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.authValidator.validateRegister, this.authController.registerUser);
    this.router.post('/verify-account', this.authValidator.validateVerifyAccountRequestBody, this.authController.verifyAccount);
    this.router.post('/send-confirmation-email', this.authController.sendConfirmationEmail);

    this.router.post('/login', this.authValidator.validateLogin, this.authController.loginUser);

    this.router.post(
      '/change-password',
      authMiddleware.isAuthenticated,
      this.authValidator.validateChangePasswordBody,
      this.authController.changePassword
    );

    this.router.post('/password-reset/initiate', this.authValidator.validateEmail, this.authController.initiatePasswordReset);
    this.router.post('/password-reset/validate-token', this.authValidator.validateToken, this.authController.validatePasswordResetToken);
    this.router.post('/set-password', this.authValidator.validateSetPassword, this.authController.setPassword);

    this.router.post('/refresh-token', this.authValidator.validateRefreshTokenRequestBody, this.authController.refreshToken);

    this.router.get('/logout', authMiddleware.isAuthenticated, this.authController.logoutUser);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default AuthRouter;
