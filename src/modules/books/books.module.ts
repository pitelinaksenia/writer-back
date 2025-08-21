import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([Book])],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
