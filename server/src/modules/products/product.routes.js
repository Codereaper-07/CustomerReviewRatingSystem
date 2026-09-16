import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from './product.controller.js';
import {
  validateProductListQuery,
  validateProductIdParam,
  validateCreateProduct,
  validateUpdateProduct,
} from './product.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';

const router = Router();

// Public reads.
router.get('/', validateProductListQuery, listProducts);
router.get('/:productId', validateProductIdParam, getProduct);

// Admin-only writes: authenticate -> requireAdmin -> validation -> controller.
router.post('/', authenticate, requireAdmin, validateCreateProduct, createProduct);
router.patch('/:productId', authenticate, requireAdmin, validateProductIdParam, validateUpdateProduct, updateProduct);
router.delete('/:productId', authenticate, requireAdmin, validateProductIdParam, deleteProduct);

export default router;
