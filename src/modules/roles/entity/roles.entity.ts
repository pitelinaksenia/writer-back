import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  value: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
