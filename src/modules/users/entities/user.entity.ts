import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinTable,
    OneToMany,
    ManyToMany,
} from 'typeorm';
import { Role } from '../../roles/entity/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ type: 'text', unique: true })
    login: string;

    @ApiProperty()
    @Column({ type: 'text' })
    passHash: string;

    @ApiProperty()
    @ManyToMany(() => Role, (role) => role.users, { cascade: true })
    @JoinTable({ name: 'users_roles' })
    roles: Role[];
}
