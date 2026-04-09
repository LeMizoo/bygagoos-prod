// backend/src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getMe,
  updateProfile,
  changePassword 
} from './auth.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchemaBase,
} from './dto';

const router = Router();

// --- ROUTES PUBLIQUES ---
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

/** * On place le logout ICI (avant protect). 
 * Cela permet de se déconnecter même si l'AccessToken est expiré.
 */
router.post('/logout', logout);

// --- ROUTES PROTÉGÉES ---
router.use(protect);

router.get('/me', getMe);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.post('/change-password', validate(changePasswordSchemaBase), changePassword);

export default router;