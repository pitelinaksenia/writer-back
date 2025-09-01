import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @Column()
    login: string;

    @ApiProperty()
    @Column()
    password: string;
}
