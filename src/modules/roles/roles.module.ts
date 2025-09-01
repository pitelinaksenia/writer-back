import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entity/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
    controllers: [RolesController],
    providers: [RolesService],
    imports: [TypeOrmModule.forFeature([Role, User])],
    exports: [RolesService],
})
export class RolesModule {}
