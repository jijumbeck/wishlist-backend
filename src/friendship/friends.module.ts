import { Module } from "@nestjs/common";
import { FriendshipController } from "./friends.controller";
import { FriendshipService } from "./friends.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { FriendRequest } from "./friends.model";
import { AuthModule } from "src/auth/auth.module";


@Module({
    controllers: [FriendshipController],
    providers: [FriendshipService],
    imports: [
        SequelizeModule.forFeature([FriendRequest]),
        AuthModule
    ],
    exports: [
        FriendshipService
    ]
})
export class FriendshipModule { }