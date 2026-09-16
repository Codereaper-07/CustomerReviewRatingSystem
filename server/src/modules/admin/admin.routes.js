import { Router } from 'express';
import { getDashboard } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboard);

export default router;
