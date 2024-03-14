import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangeUserInfoDTO, CreateUserDTO, GetUsersBySearchDTO } from './user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.model';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { info } from 'console';
import { ZodValidationPipe } from 'src/validation.pipe';
import { userShema } from './user.shema';


@UseGuards(JWTAuthGuard)
@ApiTags('User')
@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @ApiOperation({ summary: 'Получение списка пользователей, найденных по подстроке логина.' })
    @ApiResponse({ status: 200, type: [User] })
    @Get('/getUsersBySearch')
    async getUsersBySearch(@Query() query: GetUsersBySearchDTO) {
        return this.userService.getUsersBySearch(query);
    }

    @ApiOperation({ summary: 'Получение информации о пользователе.' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    async getUserInfo(@Param('id') id: string) {
        return this.userService.getUser({ id });
    }

    @ApiOperation({ summary: 'Изменение информации пользователя.' })
    @ApiResponse({ status: 200, type: User })
    @Patch(':id')
    async changeUserInfo(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(userShema)) userInfo: ChangeUserInfoDTO
    ) {
        return this.userService.changeUserInfo(id, userInfo);
    }
}
