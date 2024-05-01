import { SequelizeModule } from "@nestjs/sequelize";
import { Module, forwardRef } from "@nestjs/common";

import { Wishlist } from "./wishlist.model";
import { AuthModule } from "src/auth/auth.module";
import { GiftModule } from "src/gift/gift.module";
import { FriendshipModule } from "src/friendship/friends.module";
import { WishlistAccess } from "./wishlist-access.model";
import { WishlistController } from "./wishlist.controller";
import { WishlistService } from "./wishlist.service";
import { WishlistAccessService } from "./wishlist-access.service";
import { CoauthoringModule } from "src/coauthoring/coauthoring.module";
import { WishlistsController } from "./wishlists.controller";
import { WishlistGiftsController } from "./wishlist-gifts.controller";
import { WishlistsService } from "./wishlists.service";
import { WishlistGiftsService } from "./wishlist-gifts.service";
import { WishlistAccessController } from "./wishlist-access.controller";


@Module({
    controllers: [WishlistController, WishlistsController, WishlistGiftsController, WishlistAccessController],
    providers: [WishlistService, WishlistsService, WishlistGiftsService, WishlistAccessService],
    imports: [
        SequelizeModule.forFeature([Wishlist, WishlistAccess]),
        AuthModule,
        forwardRef(() => GiftModule),
        FriendshipModule,
        forwardRef(() => CoauthoringModule)
    ],
    exports: [
        WishlistService, WishlistsService, WishlistGiftsService
    ]
})
export class WishlistModule { }