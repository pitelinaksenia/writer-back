import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entity/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) {}

    async createRole(dto: CreateRoleDto) {
        const role = this.roleRepo.create(dto);
        return await this.roleRepo.save(role);
    }

    async getRoleByValue(value: string) {
        return await this.roleRepo.findOne({ where: { value: value } });
    }
}
