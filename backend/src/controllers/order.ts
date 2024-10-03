import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';
import { faker } from '@faker-js/faker';
import { OrderRequest } from '../types/order';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import { isValidObjectId } from 'mongoose';

export const createOrder = async (req: Request<{}, {}, OrderRequest>, res: Response, next: NextFunction) => {
  const { payment, email, phone, address, total, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new BadRequestError('Массив items не должен быть пустым'));
  }

  if (!items.every(item => isValidObjectId(item))) {
    return next(new BadRequestError('Неверный id продукта'));
  }

  try {
    const products = await Product.find({ _id: { $in: items } });
    if (products.length === 0) {
      return next(new NotFoundError(`Товар с id ${items.join(', ')} не найден`));
    }

    const validProducts = products.filter(product => product.price !== null);
    if (validProducts.length !== items.length) {
      const unavailableItems = items.filter(item => !validProducts.some(product => product.id === item));
      return next(new BadRequestError(`Товар с id ${unavailableItems.join(', ')} не продается`));
    }

    const calcTotal = validProducts.reduce((sum, product) => sum + (product.price || 0), 0);
    if (calcTotal !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    const orderId = faker.string.uuid();
    res.status(201).json({ id: orderId, total });
  } catch (err) {
    next(err);
  }
};