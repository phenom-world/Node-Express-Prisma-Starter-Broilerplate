import { Role } from '@prisma/client';
import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaginationMiddleware from '../../../middlewares/pagination.middleware';
import UserController from '../controllers/user.controller';
import UserValidator from '../validations/user.validation';

class UserRouter {
  private userController: UserController;
  private router: Router;
  private userValidator: UserValidator;
  private readonly paginationMiddleware: PaginationMiddleware;

  constructor() {
    this.router = Router();
    this.paginationMiddleware = new PaginationMiddleware();
    this.userController = new UserController();
    this.userValidator = new UserValidator();

    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.use(authMiddleware.isAuthenticated);

    this.router.get(
      '/',
      this.userValidator.validateGetUsersQuery,
      authMiddleware.authorizeRoles(Role.ADMIN),
      this.paginationMiddleware.paginate,
      this.userController.getAllUsers
    );
    this.router.get('/me', this.userController.getMe);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default UserRouter;
