import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {BooksModule} from "./modules/books/books.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432' , 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'pass',
      database: process.env.DB_NAME || 'db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    BooksModule,
  ],
})
export class AppModule {}
