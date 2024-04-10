import { Body, Controller, ForbiddenException, Get, Header, Param, Patch, Post, Query, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangeUserInfoDTO, CreateUserDTO, GetUsersBySearchDTO } from './user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.model';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZodValidationPipe } from 'src/validation.pipe';
import { userShema } from './user.shema';
import { UserInteceptor } from 'src/auth/interceptor';
import { FileInterceptor } from '@nestjs/platform-express';


@UseInterceptors(UserInteceptor)
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


    @UseGuards(JWTAuthGuard)
    @UseInterceptors(FileInterceptor('userImage'))
    @ApiOperation({ summary: 'Загрузка аватарки пользователя.' })
    @Post('/uploadImage')
    async uploadUserImage(
        @Req() request,
        @UploadedFile() userImage: Express.Multer.File
    ) {
        await this.userService.changeUserImage(request.userId, userImage);
    }


    @ApiOperation({ summary: 'Получение информации о пользователе.' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    async getUserInfo(@Param('id') id: string) {
        return this.userService.getUser({ id });
    }


    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Изменение информации пользователя.' })
    @ApiResponse({ status: 200, type: User })
    @Patch(':id')
    async changeUserInfo(
        @Req() request,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(userShema)) userInfo: ChangeUserInfoDTO
    ) {
        if (id !== request.userId) {
            throw new ForbiddenException('Пользователь может менять только свои данные.');
        }

        return this.userService.changeUserInfo(id, userInfo);
    }
}
