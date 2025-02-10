import 'dotenv/config';

import http, { Server as HttpServer } from 'http';

import App from './app';
import config from './config';
import logger from './shared/helpers/logger.helper';

class Server {
  private readonly app: App;
  private readonly server: HttpServer;
  private readonly port: number | string;

  constructor() {
    this.port = config.application.get('port') || 80;
    this.app = new App();
    this.server = http.createServer(this.app.getApp());
    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      logger.error(`uncaught exception: ${error.message}`);
      process.exit(1);
    });

    process.on('unhandledRejection', (err: Error, _promise) => {
      logger.error(`Error ${err.message}`);
      this.server.close(() => process.exit(1));
    });
  }

  start(): void {
    this.server.listen(this.port, () => {
      logger.info(`server is running in ${config.application.get('env')} mode on port ${this.port}`);
    });
  }
}

const server = new Server();
server.start();
