import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    author: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    coverPath: string;

    @Column({ nullable: true })
    sourcePath: string;
}
