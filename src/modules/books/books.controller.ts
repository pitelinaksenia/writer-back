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
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import {Book} from "./entities/book.entity";
import {CreateBookDto} from "./dto/create-book.dto";
import {UpdateBookDto} from "./dto/update-book.dto";
import {BookResponseDto} from "./dto/book-response.dto";

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {
    }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'cover', maxCount: 1 },
            { name: 'source', maxCount: 1 },
        ]),
    )
    async create(
        @Body() bookData: CreateBookDto,
        @UploadedFiles()
        files: { cover?: Express.Multer.File[]; source?: Express.Multer.File[] },
    ): Promise<Book> {
        return await this.booksService.createBook(
            bookData,
            files.cover?.[0] ?? null,
            files.source?.[0] ?? null,
        );
    }


    @Get()
    async getAll(): Promise<BookResponseDto[]> {
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
