import { Column } from 'typeorm';

export class BookResponseDto {

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    author: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    coverURL: string;

    @Column({ nullable: true })
    sourceURL: string;
}
