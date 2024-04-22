import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "src/auth/auth.module";
import { Coauthoring } from "src/coauthoring/coauthoring.model";
import { FriendRequest } from "src/friendship/friends.model";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";


@Module({
    controllers: [NotificationController],
    providers: [NotificationService],
    imports: [
        SequelizeModule.forFeature([Coauthoring, FriendRequest]),
        AuthModule
    ],
    exports: [
        NotificationService
    ]
})
export class NotificationModule { }