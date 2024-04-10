import { Module, forwardRef } from "@nestjs/common";
import { GiftController } from "./gift.controller";
import { GiftService } from "./gift.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Gift } from "./gift.model";
import { AuthModule } from "src/auth/auth.module";
import { WishlistModule } from "src/wishlist/wishlist.module";
import { FileModule } from "src/file/file.module";


@Module({
    controllers: [GiftController],
    providers: [GiftService],
    imports: [
        SequelizeModule.forFeature([Gift]),
        AuthModule,
        forwardRef(() => WishlistModule),
        FileModule
    ],
    exports: [
        GiftService
    ]
})
export class GiftModule { }