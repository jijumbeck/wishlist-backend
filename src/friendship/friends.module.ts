import { Module } from "@nestjs/common";
import { FriendshipController } from "./friends.controller";
import { FriendshipService } from "./friends.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { FriendRequest } from "./friends.model";


@Module({
    controllers: [FriendshipController],
    providers: [FriendshipService],
    imports: [
        SequelizeModule.forFeature([FriendRequest])
    ]
})
export class FriendshipModule { }