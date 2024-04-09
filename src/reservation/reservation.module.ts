import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import { ReservationController } from "./reservation.controller";
import { ReservationService } from "./reservation.service";
import { Reservation } from "./reservation.model";
import { AuthModule } from "src/auth/auth.module";
import { FriendshipModule } from "src/friendship/friends.module";
import { GiftModule } from "src/gift/gift.module";


@Module({
    controllers: [ReservationController],
    providers: [ReservationService],
    imports: [
        SequelizeModule.forFeature([Reservation]),
        AuthModule,
        FriendshipModule,
        GiftModule
    ],
    exports: [
        ReservationService
    ]
})
export class ReservationModule { }