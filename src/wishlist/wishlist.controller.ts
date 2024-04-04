import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { WishlistService } from "./wishlist.service";
import { ChangeWishlistInfoDTO } from "./wishlist.dto";
import { UserInteceptor } from "src/auth/interceptor";


@UseInterceptors(UserInteceptor)
@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
    constructor(private wishlistService: WishlistService) { }

    @ApiOperation({ summary: 'Получение списка вишлистов.' })
    @Get('/getWishlists')
    async getWishlists(
        @Req() req,
        @Body() body: { ownerId: string }
    ) {
        return await this.wishlistService.getWishlists(req.userId, body.ownerId);
    }

    @ApiOperation({ summary: 'Добавление подарка в вишлист.' })
    @Post('/addGift')
    async addGift(
        @Req() req,
        @Body() body: { wishlistId: string }
    ) {
        return await this.wishlistService.addGift(req.userId, body.wishlistId);
    }


    @ApiOperation({ summary: 'Получение подарков вишлиста.' })
    @Get('/getGifts')
    async getGifts(
        @Body() body: { wishlistId: string }
    ) {
        return await this.wishlistService.getWishlistGifts(body.wishlistId);
    }


    @ApiOperation({ summary: 'Создание вишлиста.' })
    @Post('/create')
    async createWishlist(
        @Req() req
    ) {
        return await this.wishlistService.createWishlist(req.userId);
    }


    @ApiOperation({ summary: 'Получение информации вишлиста.' })
    @Get(':id')
    async getWishlistInfo(
        @Param('id') id: string
    ) {
        return await this.wishlistService.getWishlistInfo(id);
    }


    @ApiOperation({ summary: 'Обновление информации вишлиста' })
    @Patch(':id')
    async updateWishlistInfo(
        @Req() req,
        @Param('id') id: string,
        @Body() body: ChangeWishlistInfoDTO
    ) {
        return this.wishlistService.updateWishlistInfo(req.userId, id, body);
    }


    @ApiOperation({ summary: 'Удаление вишлиста.' })
    @Delete(':id')
    async deleteWishlist(
        @Req() req,
        @Param('id') id: string
    ) {
        return await this.wishlistService.deleteWishlist(req.userId, id);
    }
}