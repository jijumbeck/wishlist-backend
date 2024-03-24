import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";
import { FriendshipService } from "./friends.service";


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
            request.user.id,
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
            request.user.id,
            body.friendToDeleteId
        );
    }


    @ApiOperation({ summary: 'Получение списка друзей пользователя.' })
    @ApiResponse({ status: 200, description: 'Список друзей успешно получен.' })
    @Get('/getFriends')
    async getFriends(
        @Body() userId: string
    ) {
        return this.friendshipService.getFriends(userId);
    }


    @ApiOperation({ summary: 'Получение списка пользователей, на которых подписался пользователь.' })
    @ApiResponse({ status: 200, description: 'Список друзей успешно получен.' })
    @Get('/getSubscribers')
    async getSubscribers(
        @Body() userId: string
    ) {
        return this.friendshipService.getSubscribers(userId);
    }


    @ApiOperation({ summary: 'Получение списка пользователей, которые подписаны на пользователя.' })
    @ApiResponse({ status: 200, description: 'Список друзей успешно получен.' })
    @Get('/getSubscripiants')
    async getSubscripiants(
        @Body() userId: string
    ) {
        return this.friendshipService.getSubscripiants(userId);
    }
}