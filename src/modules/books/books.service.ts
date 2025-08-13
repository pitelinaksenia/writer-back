import { Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import {StorageService} from "../storage/storage.service";
import {FileEditAction} from "../../common/enums/file-edit-action.enum";
import {CreateBookDto} from "./dto/create-book.dto";


@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepo: Repository<Book>,
        private readonly storageService: StorageService,
        ) {}

    async getBooks(): Promise<Book[]> {
        try {
            const books = await this.bookRepo.find();
            for (const book of books) {
                if (book.coverKey) {
                    book.coverKey = await this.storageService.getFileURL(book.coverKey, this.storageService.getCoverBucket());
                }
            }
            return books;
        } catch (error) {
            console.error('Ошибка при получении книг:', error);
            throw new InternalServerErrorException('Не удалось получить список книг');
        }
    }

    async addBook(bookData: CreateBookDto): Promise<Book> {
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
        const book = await this.bookRepo.findOne({ where: { id: bookId } });
        if (!book) throw new NotFoundException(`Книга с id ${bookId} не найдена`);

        try {
            if (book.coverKey) {
                await this.storageService.deleteFile(this.storageService.getCoverBucket(), book.coverKey);
            }
            if (book.sourceKey) {
                await this.storageService.deleteFile(this.storageService.getBookBucket(), book.sourceKey);
            }
            await this.bookRepo.delete(bookId);
            return true;
        } catch (error) {
            console.error('Ошибка при удалении книги:', error);
            throw new InternalServerErrorException('Не удалось удалить книгу');
        }
    }

    async updateBook(bookData: BookDataWithActionStatus): Promise<Book> {
        const book = await this.bookRepo.findOne({ where: { id: bookData.id } });
        if (!book) throw new NotFoundException(`Книга с id ${bookData.id} не найдена`);

        try {
            book.coverKey = await this.handleFileEditAction(
                book.id,
                bookData.coverActionStatus ?? FileEditAction.Keep,
                bookData.cover ?? null,
                this.storageService.getCoverBucket(),
                book.coverKey
            );

            book.sourceKey = await this.handleFileEditAction(
                book.id,
                bookData.sourceActionStatus ?? FileEditAction.Keep,
                bookData.source ?? null,
                this.storageService.getBookBucket(),
                book.sourceKey
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
            await this.storageService.addFile(file, bucketName, fileKey);
            filePath = fileKey;
        }
        return filePath;
    }


}