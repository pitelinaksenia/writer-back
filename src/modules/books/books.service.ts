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
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    private readonly storageService: StorageService,
  ) {}

  async getBooks(): Promise<BookResponseDto[]> {
    const books = await this.bookRepo.find();

    return Promise.all(
      books.map(async ({ coverKey, sourceKey, ...rest }) => {
        const [coverURL, sourceURL] = await Promise.all([
          coverKey
            ? this.storageService.getFileURL(coverKey, this.storageService.getCoverBucket())
            : null,
          sourceKey
            ? this.storageService.getFileURL(sourceKey, this.storageService.getBookBucket())
            : null,
        ]);

        return {
          ...rest,
          coverURL,
          sourceURL,
        };
      }),
    );
  }

  async createBook(
    bookData: CreateBookDto,
    cover: Express.Multer.File | null,
    source: Express.Multer.File | null,
  ): Promise<Book> {
    const newBook: Book = this.bookRepo.create({
      ...bookData,
      id: uuidv4(),
    });

    const tasks: Promise<void>[] = [];

    if (cover) {
      newBook.coverKey = newBook.id;
      tasks.push(
        this.storageService
          .addFile(cover, this.storageService.getCoverBucket(), newBook.coverKey)
          .then((ok) => {
            if (!ok) throw new BadRequestException('Не удалось загрузить обложку');
          }),
      );
    }

    if (source) {
      newBook.sourceKey = newBook.id;
      tasks.push(
        this.storageService
          .addFile(source, this.storageService.getBookBucket(), newBook.sourceKey)
          .then((ok) => {
            if (!ok) throw new BadRequestException('Не удалось загрузить файл книги');
          }),
      );
    }

    try {
      await Promise.all(tasks);
    } catch (error) {
      if (newBook.coverKey) {
        await this.storageService.deleteFile(
          this.storageService.getCoverBucket(),
          newBook.coverKey,
        );
      }
      throw error;
    }
    return await this.bookRepo.save(newBook);
  }

  async deleteBook(bookId: string): Promise<boolean> {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);

    await Promise.all([
      book.coverKey
        ? this.storageService.deleteFile(this.storageService.getCoverBucket(), bookId)
        : Promise.resolve(),

      book.sourceKey
        ? this.storageService.deleteFile(this.storageService.getCoverBucket(), bookId)
        : Promise.resolve(),
    ]);
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
      const tasks: Promise<void>[] = [];

      tasks.push(
        this.handleFileEditAction(
          book.id,
          bookData.coverActionStatus ?? FileEditAction.Keep,
          files.cover,
          this.storageService.getCoverBucket(),
          book.coverKey,
        ).then((key) => {
          book.coverKey = key;
        }),
      );

      tasks.push(
        this.handleFileEditAction(
          book.id,
          bookData.sourceActionStatus ?? FileEditAction.Keep,
          files.source,
          this.storageService.getBookBucket(),
          book.sourceKey,
        ).then((key) => {
          book.sourceKey = key;
        }),
      );

      await Promise.all(tasks);

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

  async getBookDetails(bookId: string): Promise<BookResponseDto> {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);

    const [coverURL, sourceURL] = await Promise.all([
      book.coverKey
        ? this.storageService.getFileURL(book.coverKey, this.storageService.getCoverBucket())
        : null,

      book.sourceKey
        ? this.storageService.getFileURL(book.sourceKey, this.storageService.getBookBucket())
        : null,
    ]);

    const { coverKey, sourceKey, ...rest } = book;

    return {
      ...rest,
      coverURL,
      sourceURL,
    };
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
