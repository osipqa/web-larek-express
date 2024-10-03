import { Router } from 'express';
import { orderValidate } from '../middlewares/validations';
import { createOrder } from '../controllers/order';

const router = Router();

router.post('/', orderValidate, createOrder);

export default router;