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


@Module({
    controllers: [WishlistController],
    providers: [WishlistService, WishlistAccessService],
    imports: [
        SequelizeModule.forFeature([Wishlist, WishlistAccess]),
        AuthModule,
        forwardRef(() => GiftModule),
        FriendshipModule,
        forwardRef(() => CoauthoringModule)
    ]
})
export class WishlistModule { }