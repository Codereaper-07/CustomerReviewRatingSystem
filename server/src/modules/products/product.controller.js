import { asyncHandler } from '../../utils/asyncHandler.js';
import { success, paginated } from '../../utils/ApiResponse.js';
import * as productService from './product.service.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts(req.query);
  res.status(200).json(paginated(items, pagination));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  res.status(200).json(success(product));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(success(product));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.productId, req.body);
  res.status(200).json(success(product));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.productId);
  res.status(200).json(success({ id: req.params.productId, deleted: true }));
});
