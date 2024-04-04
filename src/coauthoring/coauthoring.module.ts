import { Module, forwardRef } from "@nestjs/common";
import { CoauthoringController } from "./coauthoring.controller";
import { CoauthoringService } from "./coauthoring.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Coauthoring } from "./coauthoring.model";
import { WishlistModule } from "src/wishlist/wishlist.module";


@Module({
    controllers: [CoauthoringController],
    providers: [CoauthoringService],
    imports: [
        SequelizeModule.forFeature([Coauthoring]),
        forwardRef(() => WishlistModule)
    ],
    exports: [
        CoauthoringService
    ]
})
export class CoauthoringModule { }