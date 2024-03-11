import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.model';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';


@ApiTags('User')
@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @ApiOperation({ summary: 'Получение информации о пользователе' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    async getUserInfo(@Param('id') id: string) {
        return this.userService.getUser({ id });
    }

    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({ status: 200, type: User })
    @Post()
    async createUser(@Body() userDTO: CreateUserDTO) {
        return this.userService.createUser(userDTO);
    }

    @UseGuards(JWTAuthGuard)
    @Get()
    async getAll(@Req() req) {
        console.log("user: ", req?.user);
        return req?.user;
    }
}
