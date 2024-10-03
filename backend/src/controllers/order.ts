import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { isValidObjectId } from 'mongoose';
import Product from '../models/product';
import { OrderRequest } from '../types/order';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import { STATUS_CODES } from '../constants/statusCodes';

const createOrder = async (
  req: Request<{}, {}, OrderRequest>,
  res: Response,
  next: NextFunction,
) => {
  const { total, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new BadRequestError('Массив items не должен быть пустым'));
  }

  if (!items.every((item) => isValidObjectId(item))) {
    return next(new BadRequestError('Неверный id продукта'));
  }

  try {
    const validProducts = await Product.find({ _id: { $in: items }, price: { $ne: null } }).lean();

    if (validProducts.length === 0) {
      return next(new NotFoundError(`Товары с id ${items.join(', ')} не найдены или не имеют цены`));
    }

    const unValidProducts = await Product.find({ _id: { $in: items }, price: { $eq: null } }).lean();

    if (unValidProducts.length > 0) {
      const unItems = unValidProducts.map((product) => product._id.toString());
      return next(new BadRequestError(`Товар с id ${unItems.join(', ')} не продается`));
    }

    const calcTotal = validProducts.reduce((sum, product) => sum + (product.price || 0), 0);
    if (calcTotal !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    const orderId = faker.string.uuid();
    return res.status(STATUS_CODES.CREATED).json({ id: orderId, total });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
