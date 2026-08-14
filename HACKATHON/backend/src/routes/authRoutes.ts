import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate';
import { signup, login, refresh, logout, getMe, updateMe, forgotPassword, setPassword } from '../controllers/authController';

const router = Router();

// Tighter limit on auth endpoints specifically — brute-force/credential-
// stuffing protection beyond the app-wide limiter in server.ts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } },
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/set-password', authLimiter, setPassword);

export default router;
