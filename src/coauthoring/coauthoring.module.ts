import { Module, forwardRef } from "@nestjs/common";
import { CoauthoringController } from "./coauthoring.controller";
import { CoauthoringService } from "./coauthoring.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Coauthoring } from "./coauthoring.model";
import { WishlistModule } from "src/wishlist/wishlist.module";
import { AuthModule } from "src/auth/auth.module";


@Module({
    controllers: [CoauthoringController],
    providers: [CoauthoringService],
    imports: [
        SequelizeModule.forFeature([Coauthoring]),
        forwardRef(() => WishlistModule),
        AuthModule
    ],
    exports: [
        CoauthoringService
    ]
})
export class CoauthoringModule { }