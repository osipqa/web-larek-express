import Joi from 'joi';
import { celebrate, Segments } from 'celebrate';
import { IProduct } from '../models/product';

export interface IOrder {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

const orderSchema = Joi.object<IOrder>({
  payment: Joi.equal('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^((8|\+7)[- ]?)?(\(?\d{3}\)?[- ]?)?[\d\- ]{7,10}$/).required(),
  address: Joi.string().required(),
  total: Joi.number().required(),
  items: Joi.array().required(),
});

const productSchema = Joi.object<IProduct>({
  title: Joi.string().min(3).max(30).required(),
  image: ({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

export const orderValidate = celebrate({
  [Segments.BODY]: orderSchema,
});

export const productValidate = celebrate({
  [Segments.BODY]: productSchema,
});