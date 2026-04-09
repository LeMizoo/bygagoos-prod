// backend/src/types/express.d.ts

import { Types } from 'mongoose';
import { UserRole } from '../core/types/userRoles';

declare global {
  namespace Express {
    interface User {
      id: string;
      _id: Types.ObjectId | string;
      email: string;
      role: UserRole;
      name?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
      [key: string]: any;
    }

    interface Request {
      user?: User;
      token?: string;
    }
  }
}

export {};