import { NextFunction, Request, Response } from 'express';
import Product, { IProduct } from '../models/product';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import STATUS_CODES from '../constants/statusCodes';
import ServerError from '../errors/server-error';

export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().lean();
    const total = products.length;
    return res.status(STATUS_CODES.OK).send({ items: products, total });
  } catch (err) {
    return next(new ServerError('Ошибка при получении товаров'));
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const {
    title,
    image, category,
    description,
    price,
  }: IProduct = req.body;

  if (!title || !image || !category) {
    return next(new BadRequestError('Некорректные данные для создания товара'));
  }

  try {
    const newProduct = new Product({
      title,
      image,
      category,
      description,
      price,
    });
    await newProduct.save();
    return res.status(STATUS_CODES.CREATED).send(newProduct);
  } catch (err) {
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким заголовком уже существует'));
    }

    return next(new ServerError('Ошибка при создании товара'));
  }
};
