import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Book } from './modules/books/entities/book.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'pass',
  database: process.env.DB_NAME || 'db',
  synchronize: true,
  logging: true,
  entities: [Book],
  migrations: ['src/migrations/*.ts'],
});
