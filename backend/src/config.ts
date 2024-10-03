import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DB_ADDRESS = process.env.DB_ADDRESS;