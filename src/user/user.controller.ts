import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.model';


@ApiTags('User')
@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @ApiOperation({summary: 'Получение информации о пользователе'})
    @ApiResponse({status: 200, type: User})
    @Get(':id')
    async getUserInfo(@Param('id') id: string) {
        return this.userService.getUser({ id });
    }

    @ApiOperation({summary: 'Создание пользователя'})
    @ApiResponse({status: 200, type: User})
    @Post()
    async createUser(@Body() userDTO: CreateUserDTO) {
        return this.userService.createUser(userDTO);
    }
}
