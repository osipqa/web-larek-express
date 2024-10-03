import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { errors } from 'celebrate';
import productRoutes from './routes/product';
import orderRoutes from './routes/orders';
import errorHandler, { requestLogger, errorLogger } from './middlewares/error-handler';

dotenv.config();

const { PORT = 3000, DB_ADDRESS } = process.env;

const app = express();

app.use(cors());
// Логгирование запросов
app.use(requestLogger);

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(`${DB_ADDRESS}`)
  .then(() => console.log('Подключение к БД успешно'))
  .catch((err) => console.error('Ошибка подключения к БД:', err));

app.use(express.json());

// Роуты
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

// Логгирование ошибок
app.use(errorLogger);

// Обработчик ошибок
app.use(errorHandler);
app.use(errors());

app.get('/', (_req: Request, res: Response) => {
  res.send('Запуск прошел успешно!');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен -> http://localhost:${PORT}`);
});
