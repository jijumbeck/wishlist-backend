import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, GetUsersBySearchDTO } from './user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.model';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';


@UseGuards(JWTAuthGuard)
@ApiTags('User')
@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @Get('/getUsersBySearch')
    async getUsersBySearch(@Query() query: GetUsersBySearchDTO) {
        console.log(query);
        return this.userService.getUsersBySearch(query);
    }

    @ApiOperation({ summary: 'Получение информации о пользователе' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    async getUserInfo(@Param('id') id: string) {
        return this.userService.getUser({ id });
    }

    @Get()
    async getAll(@Req() req) {
        console.log("user: ", req?.user);
        return req?.user;
    }
}
