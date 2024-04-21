import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";
import { FriendshipService } from "./friends.service";
import { UserInteceptor } from "src/auth/interceptor";


@UseInterceptors(UserInteceptor)
@ApiTags('Friendship')
@Controller('friendship')
export class FriendshipController {
    constructor(private friendshipService: FriendshipService) { }

    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Запрос на дружбу.' })
    @ApiResponse({ status: 200, description: 'Запрос отправлен или принят.' })
    @Post('/addFriend')
    async addFriend(
        @Req() request,
        @Body() body: { requestRecieverId: string }
    ) {
        return this.friendshipService.addFriend(
            request.userId,
            body.requestRecieverId
        );
    }

    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Удаление друга / Отписка от пользователя.' })
    @ApiResponse({ status: 200, description: 'Друг удален / Отписка.' })
    @ApiResponse({ status: 400, description: 'Пользователи не находятся в друзьях.' })
    @Post('/deleteFriend')
    async deleteFriend(
        @Req() request,
        @Body() body: { friendToDeleteId: string }
    ) {
        return this.friendshipService.deleteFriend(
            request.userId,
            body.friendToDeleteId
        );
    }


    @ApiOperation({ summary: 'Получение списка друзей пользователя.' })
    @ApiResponse({ status: 200, description: 'Список друзей успешно получен.' })
    @Get('/getFriends')
    async getFriends(
        @Query('userId') userId: string
    ) {
        return this.friendshipService.getFriends(userId);
    }


    @ApiOperation({ summary: 'Получение списка пользователей, на которых подписался пользователь.' })
    @ApiResponse({ status: 200, description: 'Список друзей успешно получен.' })
    @Get('/getSubscribers')
    async getSubscribers(
        @Query('userId') userId: string
    ) {
        return this.friendshipService.getSubscribers(userId);
    }


    @ApiOperation({ summary: 'Получение списка пользователей, которые подписаны на пользователя.' })
    @ApiResponse({ status: 200, description: 'Список друзей успешно получен.' })
    @Get('/getSubscripiants')
    async getSubscripiants(
        @Query('userId') userId: string
    ) {
        return this.friendshipService.getSubscripiants(userId);
    }

    @ApiOperation({ summary: "Получение запроса на дружбу" })
    @Get('/getFriendshipStatus')
    async getFriendshipStatus(
        @Req() request,
        @Query('userId') userId: string
    ) {
        return await this.friendshipService.getFriendshipStatus(request.userId, userId);
    }
}