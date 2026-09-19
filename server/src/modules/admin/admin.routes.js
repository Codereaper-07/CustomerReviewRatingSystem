import { Router } from 'express';
import { getDashboard, getProductInsights } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboard);
router.get('/product-insights', authenticate, requireAdmin, getProductInsights);

export default router;
