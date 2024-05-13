import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import { ReservationController } from "./reservation.controller";
import { ReservationService } from "./reservation.service";
import { Reservation } from "./reservation.model";
import { AuthModule } from "src/auth/auth.module";
import { GiftModule } from "src/gift/gift.module";
import { GuestReservation } from "./guestReservation.model";
import { WishlistModule } from "src/wishlist/wishlist.module";


@Module({
    controllers: [ReservationController],
    providers: [ReservationService],
    imports: [
        SequelizeModule.forFeature([Reservation, GuestReservation]),
        AuthModule,
        GiftModule,
        WishlistModule
    ],
    exports: [
        ReservationService
    ]
})
export class ReservationModule { }