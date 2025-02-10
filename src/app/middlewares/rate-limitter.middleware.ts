import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const WINDOW_DURATION_MS = 15 * 60;
const MAX_REQUESTS_PER_WINDOW = 100;
const TOO_MANY_REQUESTS_MESSAGE = 'Too many requests, please try again later.';

const rateLimiter = new RateLimiterMemory({
  duration: WINDOW_DURATION_MS,
  points: MAX_REQUESTS_PER_WINDOW,
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip!;

  rateLimiter
    .consume(ip)
    .then((rateLimiterRes) => {
      res.set('Retry-After', (rateLimiterRes.msBeforeNext / 1000).toFixed(0));
      res.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
      res.set('X-RateLimit-Remaining', String(rateLimiterRes.remainingPoints));
      res.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

      next();
    })
    .catch(() => {
      console.warn(`Rate limit exceeded for IP: ${ip}`);

      res.status(429).send({
        message: TOO_MANY_REQUESTS_MESSAGE,
        retryAfter: WINDOW_DURATION_MS.toFixed(0),
      });
    });
};

export default rateLimiterMiddleware;
