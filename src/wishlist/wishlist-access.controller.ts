import { Post, Req, Body, Delete, Controller, UseInterceptors, UseGuards, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { WishlistAccessService } from "./wishlist-access.service";
import { UserInteceptor } from "src/auth/interceptor";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";


@UseInterceptors(UserInteceptor)
@UseGuards(JWTAuthGuard)
@ApiTags('Wishlist Custom Access')
@Controller('wishlist-access')
export class WishlistAccessController {
    constructor(private wishlistAccessService: WishlistAccessService) { }

    @ApiOperation({ summary: 'Получение пользователей, которым доступен вишлист' })
    @Get()
    async getAccessUsers(
        @Query() param: { wishlistId: string }
    ) {
        return await this.wishlistAccessService.getUsers(param.wishlistId);
    }

    @ApiOperation({ summary: 'Раздача доступа вишлиста с настройкой Custom пользователям.' })
    @Post()
    async giveAccessToUsers(
        @Req() request,
        @Body() body: { users: string[], wishlistId: string }
    ) {
        const promises = body.users.map(user => this.wishlistAccessService.shareAccess(request.userId, user, body.wishlistId));
        return Promise.all(promises)
            .then(() => 'Доступ открыт.')
    }


    @ApiOperation({ summary: 'Запрет доступа вишлиста с настройкой Custom пользователям.' })
    @Delete()
    async forbidAccessToUsers(
        @Req() request,
        @Body() body: { users: string[], wishlistId: string }
    ) {
        const promises = body.users.map(user => this.wishlistAccessService.forbidAccess(request.userId, user, body.wishlistId));
        return Promise.all(promises)
            .then(() => 'Доступ закрыт.')
    }
}