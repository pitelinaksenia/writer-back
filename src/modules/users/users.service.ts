import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly rolesService: RolesService,
    ) {}
    async createUser(dto: CreateUserDto) {
        const newUser: User = this.userRepo.create({
            ...dto,
            id: uuidv4(),
        });
        const role = await this.rolesService.getRoleByValue('USER');
        if (!role) {
            throw new Error('Role USER not found');
        }
        newUser.roles = [role];
        await this.userRepo.save(newUser);
        return newUser;
    }
}
