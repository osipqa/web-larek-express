import { Router } from 'express';
import { productValidate } from '../middlewares/validations';
import { createProduct, getAllProducts } from '../controllers/products';

const router = Router();

router.get('/', getAllProducts);
router.post('/', productValidate, createProduct);

export default router;
