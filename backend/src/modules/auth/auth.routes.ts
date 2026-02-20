import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from './auth.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();

// Routes publiques avec rate limiting spécifique
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', refreshToken);

// Routes protégées
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;