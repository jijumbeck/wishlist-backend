import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Coauthoring, CoauthoringStatus } from "src/coauthoring/coauthoring.model";
import { FriendRequest, FriendRequestStatus } from "src/friendship/friends.model";
import { Notification, NotificationType } from "./notification.dto";




@Injectable()
export class NotificationService {
    constructor(@InjectModel(Coauthoring) private coauthoringRepository: typeof Coauthoring,
        @InjectModel(FriendRequest) private friendRepository: typeof FriendRequest) { }


    async getNotifications(userId: string) {
        const coauthoringNotifications: Notification[] =
            (await this.getCoauthoringNotifications(userId))
                .map(value => { return { type: NotificationType.Coauthoring, requestReceiverId: userId } as Notification });

        const friendNotifications: Notification[] =
            (await this.getFriendNotifications(userId))
                .map(value => { return { type: NotificationType.Friend, requestSenderId: value.userIdFirst, requestReceiverId: userId } })

        return [...coauthoringNotifications, ...friendNotifications];
    }

    private async getCoauthoringNotifications(userId: string) {
        return await this.coauthoringRepository.findAll({
            where: {
                userId: userId,
                status: CoauthoringStatus.Sent
            }
        });
    }

    private async getFriendNotifications(userId: string) {
        return await this.friendRepository.findAll({
            where: {
                userIdSecond: userId,
                status: FriendRequestStatus.Subscriber
            }
        });
    }

}