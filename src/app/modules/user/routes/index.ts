import { Express } from 'express';

import AuthRouter from './auth.routes';
import UserRouter from './user.routes';

class LoadUserRouters {
  private authRouter: AuthRouter;
  private userRouter: UserRouter;

  constructor(private readonly router: Express) {
    this.authRouter = new AuthRouter();
    this.userRouter = new UserRouter();
  }

  loadRouters(): void {
    this.router.use('/api/v1/auth', this.authRouter.getRouter());
    this.router.use('/api/v1/user', this.userRouter.getRouter());
  }
}

export default LoadUserRouters;
