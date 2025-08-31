import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty()
    @Column()
    value: string;

    @ApiProperty()
    @Column()
    description: string;
}
