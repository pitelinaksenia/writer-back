import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async createUser(dto: CreateUserDTO) {
    const newUser: User = this.userRepo.create({
      ...dto,
      id: uuidv4(),
    });
    await this.userRepo.save(newUser);
    return newUser;
  }
}
