import { Column } from 'typeorm';

export class BookResponseDto {

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string | null;

    @Column()
    author: string;

    @Column({ nullable: true })
    year: string | null;

    @Column({ nullable: true })
    coverURL: string | null;

    @Column({ nullable: true })
    sourceURL: string | null;
}
