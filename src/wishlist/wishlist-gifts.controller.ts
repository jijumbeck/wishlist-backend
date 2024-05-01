import { Body, Controller, Get, Post, Query, Req, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { WishlistGiftsService } from "./wishlist-gifts.service";
import { UserInteceptor } from "src/auth/interceptor";


@UseInterceptors(UserInteceptor)
@ApiTags('Wishlist Gifts')
@Controller('wishlist-gifts')
export class WishlistGiftsController {
    constructor(
        private wishlistGiftService: WishlistGiftsService
    ) { }

    @ApiOperation({ summary: 'Добавление подарка в вишлист.' })
    @Post()
    async addGift(
        @Req() req,
        @Body() body: { wishlistId: string, giftId?: string }
    ) {
        return await this.wishlistGiftService.addGift(req.userId, body.wishlistId, body.giftId);
    }


    @ApiOperation({ summary: 'Получение подарков вишлиста.' })
    @Get()
    async getGifts(
        @Query() query: { wishlistId: string }
    ) {
        return await this.wishlistGiftService.getWishlistGifts(query.wishlistId);
    }

}