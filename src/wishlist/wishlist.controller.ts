import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { WishlistService } from "./wishlist.service";
import { ChangeWishlistInfoDTO } from "./wishlist.dto";
import { UserInteceptor } from "src/auth/interceptor";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";


@UseInterceptors(UserInteceptor)
@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
    constructor(private wishlistService: WishlistService) { }


    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Создание вишлиста.' })
    @Post()
    async createWishlist(
        @Req() req
    ) {
        return await this.wishlistService.createWishlist(req.userId);
    }


    @ApiOperation({ summary: 'Получение информации вишлиста.' })
    @Get(':id')
    async getWishlistInfo(
        @Param('id') id: string,
        @Req() request
    ) {
        return await this.wishlistService.getWishlistInfo(request.userId, id);
    }


    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Обновление информации вишлиста' })
    @Patch(':id')
    async updateWishlistInfo(
        @Req() req,
        @Param('id') id: string,
        @Body() body: ChangeWishlistInfoDTO
    ) {
        return this.wishlistService.updateWishlistInfo(req.userId, id, body);
    }


    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Удаление вишлиста.' })
    @Delete('/:id')
    async deleteWishlist(
        @Req() req,
        @Param('id') id: string
    ) {
        return await this.wishlistService.deleteWishlist(req.userId, id);
    }
}