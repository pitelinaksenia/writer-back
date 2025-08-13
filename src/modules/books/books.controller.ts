import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { BooksService } from './books.service';
import * as bookTypes from './book-types';
import {Book} from "./entities/book.entity";

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {
    }

    @Get()
    async getAll(): Promise<Book[]> {
        return await this.booksService.getBooks();
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<Book> {
        return await this.booksService.getBookDetails(id);
    }

    @Post()
    async create(@Body() bookData: bookTypes.CreateBookDto): Promise<Book> {
        return await this.booksService.addBook(bookData);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() bookData: bookTypes.BookDataWithActionStatus,
    ): Promise<Book> {
        return await this.booksService.updateBook({ ...bookData, id });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
    async delete(@Param('id') id: string): Promise<void> {
        await this.booksService.deleteBook(id);
    }
}
