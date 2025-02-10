import 'dotenv/config';

import Table from 'cli-table';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import listAllRoutes, { Endpoint } from 'express-list-endpoints';
import helmet from 'helmet';
import morgan from 'morgan';

import config from '../config';
import logger from '../shared/helpers/logger.helper';
import { connect } from '../shared/utils/redis.util';
import { ObjectData } from '../types';
import { ErrorMiddleware, notFound, rateLimiterMiddleware } from './middlewares';
import { EventHandlers } from './modules/utility/events';
import eventService from './modules/utility/services/events.service';
import AppRouter from './router';
class App {
  private readonly app: Express;
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.registerRoutes();
    this.displayRoutes();
    this.initiateCacheConnection();

    this.setupEventListeners();
    this.initiateErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.disable('x-powered-by');
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.use(rateLimiterMiddleware);

    // CORS configuration
    this.app.use(
      cors({
        origin: ['http://localhost:3000', process.env.FRONTEND_CLIENT_BASE_URL!].filter(Boolean),
        credentials: true,
      })
    );

    // Development logging
    if (config.application.get('env') === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(
        morgan(
          ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
          { stream: { write: (message) => logger.log('info', message.trim(), { tags: ['http'] }) } }
        )
      );
    }
    this.app.use(helmet());
  }

  private initiateCacheConnection(): void {
    connect(config.services.get('redis'));
  }

  private initiateErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(ErrorMiddleware);
  }

  private setupEventListeners(): void {
    Object.entries(EventHandlers.handlers).forEach(([event, handler]) => {
      eventService.listen(event, handler.handle.bind(handler));
    });
  }

  private registerRoutes(): void {
    new AppRouter(this.app).loadRouters();
  }

  private displayRoutes(): void {
    const allRoutes = listAllRoutes(this.app);
    const routesList = allRoutes.map((route: Endpoint) => {
      const obj = {} as ObjectData;
      obj[route.path] = route.methods.join(' | ');
      return obj;
    });

    const table = new Table();
    table.push({ Endpoints: 'Methods' }, ...routesList);

    logger.info(table.toString());
  }

  getApp(): Express {
    return this.app;
  }
}

export default App;
