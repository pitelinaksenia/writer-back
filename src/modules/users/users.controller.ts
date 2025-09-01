import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('create')
    @ApiOperation({ summary: 'Create user' })
    async create(
        @Body()
        userDTO: CreateUserDto,
    ) {
        return this.userService.createUser(userDTO);
    }
}
