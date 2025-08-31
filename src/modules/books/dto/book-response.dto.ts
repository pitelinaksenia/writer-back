import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class BookResponseDto {
    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column({ nullable: true })
    description: string | null;

    @ApiProperty()
    @Column()
    author: string;

    @ApiProperty()
    @Column({ nullable: true })
    year: string | null;

    @ApiProperty()
    @Column({ nullable: true })
    coverURL: string | null;

    @ApiProperty()
    @Column({ nullable: true })
    sourceURL: string | null;
}
