import { UserRole } from '../../core/types/userRoles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        _id?: string;
      };
      deviceId?: string;
    }
  }
}
