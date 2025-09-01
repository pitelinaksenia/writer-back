import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
@ApiTags('Roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post('create')
    @ApiOperation({ summary: 'Create role' })
    async create(
        @Body()
        roleDto: CreateRoleDto,
    ) {
        return await this.rolesService.createRole(roleDto);
    }

    @Get('byValue/:value')
    @ApiOperation({ summary: 'Get role by value' })
    async getRoleByValue(@Param('value') value: string) {
        return await this.rolesService.getRoleByValue(value);
    }
}
