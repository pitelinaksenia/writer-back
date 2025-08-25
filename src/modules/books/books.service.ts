import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { StorageService } from '../storage/storage.service';
import { FileEditAction } from '../../common/enums/file-edit-action.enum';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { ApiTags } from '@nestjs/swagger';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    private readonly storageService: StorageService,
  ) {}

  async getBooks(): Promise<BookResponseDto[]> {
    const books = await this.bookRepo.find();
    const booksResponse: BookResponseDto[] = [];

    for (const book of books) {
      let coverUrl = book.coverKey;
      if (book.coverKey) {
        book.coverKey = await this.storageService.getFileURL(
          book.coverKey,
          this.storageService.getCoverBucket(),
        );
      }
      let sourceUrl = book.sourceKey;
      if (book.sourceKey) {
        book.sourceKey = await this.storageService.getFileURL(
          book.sourceKey,
          this.storageService.getBookBucket(),
        );
      }

      const { coverKey, sourceKey, ...rest } = book;

      booksResponse.push({
        ...rest,
        coverURL: coverUrl,
        sourceURL: sourceUrl,
      });
    }
    return booksResponse;
  }

  async createBook(
    bookData: CreateBookDto,
    cover: Express.Multer.File | null,
    source: Express.Multer.File | null,
  ): Promise<Book> {
    const newBook: Book = this.bookRepo.create(bookData);

    if (cover) {
      const coverKey = newBook.id;
      let result = await this.storageService.addFile(
        cover,
        this.storageService.getCoverBucket(),
        coverKey,
      );
      if (!result) {
        throw new BadRequestException('Не удалось загрузить обложку');
      }
    }

    if (source) {
      const sourceKey = newBook.id;
      let result = await this.storageService.addFile(
        source,
        this.storageService.getBookBucket(),
        sourceKey,
      );
      if (!result) {
        if (newBook.coverKey) {
          await this.storageService.deleteFile(
            this.storageService.getCoverBucket(),
            newBook.coverKey,
          );
        }
        throw new BadRequestException('Не удалось загрузить файл книги');
      }
    }

    return await this.bookRepo.save(newBook);
  }

  async deleteBook(bookId: string): Promise<boolean> {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);

    if (book.coverKey) {
      await this.storageService.deleteFile(this.storageService.getCoverBucket(), book.coverKey);
    }

    if (book.sourceKey) {
      await this.storageService.deleteFile(this.storageService.getBookBucket(), book.sourceKey);
    }
    await this.bookRepo.delete(bookId);
    return true;
  }

  async updateBook(
    bookData: UpdateBookDto & { id: string },
    files: { cover: Express.Multer.File | null; source: Express.Multer.File | null },
  ): Promise<Book> {
    const book = await this.bookRepo.findOne({ where: { id: bookData.id } });
    if (!book) throw new NotFoundException(`Книга с id ${bookData.id} не найдена`);

    try {
      book.coverKey = await this.handleFileEditAction(
        book.id,
        bookData.coverActionStatus ?? FileEditAction.Keep,
        files.cover,
        this.storageService.getCoverBucket(),
        book.coverKey,
      );

      book.sourceKey = await this.handleFileEditAction(
        book.id,
        bookData.sourceActionStatus ?? FileEditAction.Keep,
        files.source,

        this.storageService.getBookBucket(),
        book.sourceKey,
      );

      book.title = bookData.title;
      book.author = bookData.author;
      book.description = bookData.description;
      book.year = bookData.year;

      return await this.bookRepo.save(book);
    } catch (error) {
      console.error('Ошибка при обновлении книги:', error);
      throw new InternalServerErrorException('Не удалось обновить книгу');
    }
  }

  async getBookDetails(bookId: string): Promise<Book> {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);

    if (book.coverKey) {
      book.coverKey = await this.storageService.getFileURL(
        book.coverKey,
        this.storageService.getCoverBucket(),
      );
    }
    if (book.sourceKey) {
      book.sourceKey = await this.storageService.getFileURL(
        book.sourceKey,
        this.storageService.getBookBucket(),
      );
    }

    return book;
  }

  private async handleFileEditAction(
    fileKey: string,
    editAction: FileEditAction,
    file: Express.Multer.File | null,
    bucketName: string,
    currentFilePath: string | null,
  ): Promise<string | null> {
    let filePath: string | null = currentFilePath;
    if (editAction === FileEditAction.Remove) {
      await this.storageService.deleteFile(bucketName, fileKey);
      filePath = null;
    } else if (editAction === FileEditAction.Replace && file) {
      await this.storageService.addFile(file, bucketName, fileKey);
      filePath = fileKey;
    }
    return filePath;
  }
}
