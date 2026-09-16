import { Router } from 'express';
import { register, login, logout, me } from './auth.controller.js';
import { validateRegister, validateLogin } from './auth.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { loginRateLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', loginRateLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
