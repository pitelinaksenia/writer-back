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
import {Book} from "./entities/book.entity";
import {CreateBookDto} from "./dto/create-book.dto";
import {UpdateBookDto} from "./dto/update-book.dto";

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {
    }

    @Post()
    async create(@Body() bookData: CreateBookDto): Promise<Book> {
        return await this.booksService.createBook(bookData);
    }

    @Get()
    async getAll(): Promise<Book[]> {
        return await this.booksService.getBooks();
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<Book> {
        return await this.booksService.getBookDetails(id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() bookData: UpdateBookDto,
    ): Promise<Book> {
        return await this.booksService.updateBook({ ...bookData, id });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
    async delete(@Param('id') id: string): Promise<void> {
        await this.booksService.deleteBook(id);
    }
}
