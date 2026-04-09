// backend/src/types/express/index.ts

import { RequestUser } from '../../middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      token?: string;
    }
  }
}

export {};