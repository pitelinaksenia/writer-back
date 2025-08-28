import { Injectable, Logger } from '@nestjs/common';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly s3: S3Client;
    private readonly coverBucket: string;
    private readonly bookBucket: string;

    constructor() {
        this.s3 = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
            region: process.env.AWS_REGION!,
            endpoint: process.env.AWS_ENDPOINT!,
            forcePathStyle: false,
        });

        this.coverBucket = process.env.AWS_COVER_BUCKET!;
        this.bookBucket = process.env.AWS_BOOK_BUCKET!;
    }

    getCoverBucket() {
        return this.coverBucket;
    }

    getBookBucket() {
        return this.bookBucket;
    }

    async addFile(file: Express.Multer.File, bucketName: string, filePath: string): Promise<boolean> {
        if (!file) {
            this.logger.warn('Попытка загрузки пустого файла');
            return false;
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await this.s3.send(command);
            this.logger.log(`Файл ${filePath} успешно загружен в ${bucketName}`);
            return true;
        } catch (error) {
            this.logger.error('Ошибка загрузки файла', error);
            return false;
        }
    }

    async getFileURL(fileKey: string, bucketName: string): Promise<string> {
        if (!fileKey) return '';
        try {
            const command = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });
            return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
        } catch (error) {
            this.logger.error('Ошибка получения URL файла', error);
            return '';
        }
    }

    async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
        if (!filePath) {
            this.logger.warn('Удаление файла с пустым путем отменено');
            return false;
        }

        try {
            const command = new DeleteObjectCommand({ Bucket: bucketName, Key: filePath });
            await this.s3.send(command);
            this.logger.log(`Файл ${filePath} удален из ${bucketName}`);
            return true;
        } catch (error) {
            this.logger.error(`Ошибка удаления файла ${filePath}`, error);
            return false;
        }
    }
}
