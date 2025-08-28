import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('books')
@ApiTags('Books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create book' })
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

  @Get('getAll')
  @ApiOperation({ summary: 'Get books' })
  async getAll(): Promise<BookResponseDto[]> {
    return await this.booksService.getBooks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Book Details' })
  async getOne(@Param('id') id: string): Promise<BookResponseDto> {
    return await this.booksService.getBookDetails(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update book' })
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() bookData: UpdateBookDto,
    @UploadedFiles() files: { cover?: Express.Multer.File[]; source?: Express.Multer.File[] },
  ): Promise<Book> {
    return await this.booksService.updateBook(
      { ...bookData, id }, 
      {
        cover: files.cover?.[0] ?? null,
        source: files.source?.[0] ?? null,
      }, // файлы отдельно
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.booksService.deleteBook(id);
  }
}
