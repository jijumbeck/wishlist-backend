import { SequelizeModule } from "@nestjs/sequelize";
import { Wishlist } from "./wishlist.model";
import { AuthModule } from "src/auth/auth.module";
import { Module, forwardRef } from "@nestjs/common";
import { GiftModule } from "src/gift/gift.module";
import { FriendshipModule } from "src/friendship/friends.module";


@Module({
    controllers: [],
    providers: [],
    imports: [
        SequelizeModule.forFeature([Wishlist]),
        AuthModule,
        forwardRef(() => GiftModule),
        FriendshipModule
    ]
})
export class WishlistModule { }