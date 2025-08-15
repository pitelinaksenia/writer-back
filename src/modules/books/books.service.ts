import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import {StorageService} from "../storage/storage.service";
import {FileEditAction} from "../../common/enums/file-edit-action.enum";
import {CreateBookDto} from "./dto/create-book.dto";
import {UpdateBookDto} from "./dto/update-book.dto";
import {BookResponseDto} from "./dto/book-response.dto";


@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepo: Repository<Book>,
        private readonly storageService: StorageService,

        ) {}

    private readonly logger = new Logger(BooksService.name);

    async getBooks(): Promise<BookResponseDto[]> {

        const books = await this.bookRepo.find();
        const booksResponse: BookResponseDto[] = []

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


    async createBook(bookData: CreateBookDto): Promise<Book> {
        const books = await this.bookRepo.find();

        let coverPath: string | null = null;
        let sourcePath: string | null = null;

        try {
            if (bookData.cover && bookData.cover instanceof File) {
                coverPath = bookData.id;
                if (!(await this.storageService.addFile(bookData.cover, this.storageService.getCoverBucket(), coverPath))) {
                    throw new BadRequestException('Не удалось загрузить обложку');
                }
            }

            if (bookData.source) {
                sourcePath = bookData.id;
                if (!(await this.storageService.addFile(bookData.source, this.storageService.getBookBucket(), sourcePath))) {
                    if (coverPath) await this.storageService.deleteFile(this.storageService.getCoverBucket(), coverPath);
                    throw new BadRequestException('Не удалось загрузить файл книги');
                }
            }

            const newBook = this.bookRepo.create({
                title: bookData.title,
                author: bookData.author,
                description: bookData.description,
                year: bookData.year,
                coverPath,
                sourcePath,
            });

            return await this.bookRepo.save(newBook);
        } catch (error) {
            console.error('Ошибка при добавлении книги:', error);
            throw error instanceof BadRequestException ? error : new InternalServerErrorException('Ошибка сервера при добавлении книги');
        }
    }

    async deleteBook(bookId: string): Promise<boolean> {
        return true;
        // const book = await this.bookRepo.findOne({ where: { id: bookId } });
        // if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);
        //
        // try {
        //     if (book.coverKey) {
        //         await this.storageService.deleteFile(this.storageService.getCoverBucket(), book.coverKey);
        //     }
        //     if (book.sourceKey) {
        //         await this.storageService.deleteFile(this.storageService.getBookBucket(), book.sourceKey);
        //     }
        //     await this.bookRepo.delete(bookId);
        //     return true;
        // } catch (error) {
        //     console.error('Ошибка при удалении книги:', error);
        //     throw new InternalServerErrorException('Не удалось удалить книгу');
        // }
    }

    async updateBook(bookData: UpdateBookDto): Promise<Book> {
        const books = await this.bookRepo.find();
        return books[0];
        // const book = await this.bookRepo.findOne({ where: { id: bookData.id } });
        // if (!book) throw new NotFoundException(`Книга с id ${bookData.id} не найдена`);
        //
        // try {
        //     book.coverKey = await this.handleFileEditAction(
        //         book.id,
        //         bookData.coverActionStatus ?? FileEditAction.Keep,
        //         bookData.cover ?? null,
        //         this.storageService.getCoverBucket(),
        //         book.coverKey
        //     );
        //
        //     book.sourceKey = await this.handleFileEditAction(
        //         book.id,
        //         bookData.sourceActionStatus ?? FileEditAction.Keep,
        //         bookData.source ?? null,
        //         this.storageService.getBookBucket(),
        //         book.sourceKey
        //     );
        //
        //     book.title = bookData.title;
        //     book.author = bookData.author;
        //     book.description = bookData.description;
        //     book.year = bookData.year;
        //
        //     return await this.bookRepo.save(book);
        // } catch (error) {
        //     console.error('Ошибка при обновлении книги:', error);
        //     throw new InternalServerErrorException('Не удалось обновить книгу');
        // }
    }

    async getBookDetails(bookId: string): Promise<Book> {
        const books = await this.bookRepo.find();
        try {
            const book = await this.bookRepo.findOne({ where: { id: bookId } });
            if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);

            if (book.coverKey) {
                book.coverKey = await this.storageService.getFileURL(book.coverKey, this.storageService.getCoverBucket());
            }
            if (book.sourceKey) {
                book.sourceKey = await this.storageService.getFileURL(book.sourceKey, this.storageService.getBookBucket());
            }

            return book;
        } catch (error) {
            console.error('Ошибка при получении книги:', error);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('Ошибка при получении книги');
        }
    }

    private async handleFileEditAction(
        fileKey: string,
        editAction: FileEditAction,
        file: File | null,
        bucketName: string,
        currentFilePath: string | null,
    ): Promise<string | null> {
        let filePath: string | null = currentFilePath;
        if (editAction === FileEditAction.Remove) {
            await this.storageService.deleteFile(bucketName, fileKey);
            filePath = null;
        } else if (editAction === FileEditAction.Replace && file) {
            // await this.storageService.addFile(file, bucketName, fileKey);
            filePath = fileKey;
        }
        return filePath;
    }


}