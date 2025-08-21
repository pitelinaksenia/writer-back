import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  author: string;

  @Column({ type: 'text', nullable: true })
  year: string | null;

  @Column({ type: 'text', nullable: true })
  coverKey: string | null;

  @Column({ type: 'text', nullable: true })
  sourceKey: string | null;
}
