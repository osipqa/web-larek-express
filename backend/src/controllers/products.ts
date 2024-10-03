import { NextFunction, Request, Response } from 'express';
import Product, { IProduct } from '../models/product';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    const total = products.length;
    return res.send({ items: products, total });
  } catch (err) {
    return res.status(500).send({ message: 'Ошибка при получении товаров' }); // Возвращаем результат
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const {
    title,
    image, category,
    description,
    price,
  }: IProduct = req.body;

  // Проверка валидации
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
    return res.status(201).send(newProduct);
  } catch (err) {
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким заголовком уже существует'));
    }

    return next(new BadRequestError('Ошибка при создании товара'));
  }
};
