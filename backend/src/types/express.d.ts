// backend/src/types/express.d.ts

import 'express';
import { Types } from 'mongoose';
import type { UserRole } from '../core/types/userRoles';

declare global {
  namespace Express {
    // Extension de l'objet User
    interface User {
      id: string;
      _id: Types.ObjectId | string;
      email: string;
      role: UserRole;

      name?: string;
      firstName?: string;
      lastName?: string;

      isActive?: boolean;
      phone?: string;
      avatar?: string;

      createdAt?: Date;
      updatedAt?: Date;

      [key: string]: any;
    }

    // Extension de Request
    interface Request {
      user?: User;
      token?: string;

      file?: Express.Multer.File;

      files?:
        | Express.Multer.File[]
        | {
            [fieldname: string]: Express.Multer.File[];
          };

      rawBody?: Buffer;
    }
  }
}

export {};
