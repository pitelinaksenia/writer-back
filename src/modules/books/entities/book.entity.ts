import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('books')
export class Book {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    description: string | null;

    @ApiProperty()
    @Column()
    author: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    year: string | null;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    coverKey: string | null;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    sourceKey: string | null;
}
