import { TokenPayload } from '../app/modules/utility/interfaces/jwt.interface';

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload & {
        email: string;
        status: string;
      };
    }
  }
}
