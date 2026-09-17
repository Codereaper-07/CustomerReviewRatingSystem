import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from './notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', listNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
