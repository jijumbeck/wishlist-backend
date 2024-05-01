import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { WishlistsService } from "./wishlists.service";
import { Controller, Get, Query, Req, UseInterceptors } from "@nestjs/common";
import { UserInteceptor } from "src/auth/interceptor";


@UseInterceptors(UserInteceptor)
@ApiTags('Wishlists')
@Controller('wishlists')
export class WishlistsController {
    constructor(private wishlistsService: WishlistsService) { }


    @ApiOperation({ summary: 'Получение публичных вишлистов по поиску.' })
    @Get('/public')
    async getPublicWishlists(
        @Query() query: { search: string }
    ) {
        return await this.wishlistsService.getPublicWishlistsBySearch(query.search ? query.search : '');
    }


    @ApiOperation({ summary: 'Получение списка вишлистов.' })
    @Get()
    async getWishlists(
        @Req() req,
        @Query() query: { ownerId: string }
    ) {
        const wishlists = await this.wishlistsService.getWishlists(req.userId, query.ownerId);
        wishlists.sort((first, second) => {
            return second.updatedAt - first.updatedAt;
        })
        return wishlists;
    }
}