import { Express, Request, Response } from 'express';

import LoadUserRouters from './modules/user/routes';

class AppRouter {
  private readonly userRouters: LoadUserRouters;

  constructor(private readonly app: Express) {
    this.userRouters = new LoadUserRouters(this.app);
  }

  loadRouters(): void {
    this.healthCheck(this.app);

    // Register all routers here
    this.userRouters.loadRouters();
  }

  private healthCheck(app: Express): void {
    app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Broilerplate Backend Service',
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default AppRouter;
