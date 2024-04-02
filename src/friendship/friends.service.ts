import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { FriendRequest, FriendRequestStatus } from "./friends.model";
import { Op } from "sequelize";


@Injectable()
export class FriendshipService {
    constructor(@InjectModel(FriendRequest) private friendRequestRepository: typeof FriendRequest) { }

    async addFriend(requestSenderId: string, requestRecieverId: string) {
        if (requestSenderId === requestRecieverId) {
            throw new BadRequestException('addFriend method got same ids.');
        }

        // Use case when reciever has already sent request to first.
        const request = await this.friendRequestRepository.findOne({
            where: {
                userIdFirst: requestRecieverId,
                userIdSecond: requestSenderId
            }
        })

        if (request) {
            request.status = FriendRequestStatus.Friend;
            request.save();
            return 'Пользователи добавлены в друзья.';
        }

        const newRequest = await this.friendRequestRepository.create({
            userIdFirst: requestSenderId,
            userIdSecond: requestRecieverId,
            status: FriendRequestStatus.Subscriber
        });

        return 'Запрос создан';
    }

    async deleteFriend(initiatorId: string, friendToDeleteId: string) {
        if (initiatorId === friendToDeleteId) {
            throw new BadRequestException('deleteFriend method got same ids.');
        }

        const request = await this.friendRequestRepository.findOne({
            where: {
                [Op.or]: [
                    {
                        userIdFirst: initiatorId,
                        userIdSecond: friendToDeleteId,
                    },
                    {
                        userIdFirst: friendToDeleteId,
                        userIdSecond: initiatorId,
                    }
                ]
            }
        });

        if (!request) {
            throw new BadRequestException('Пользователи не друзья.');
        }

        if (request.userIdFirst === initiatorId) {
            if (request.status === FriendRequestStatus.Subscriber) {
                await this.friendRequestRepository.destroy({
                    where: {
                        userIdFirst: initiatorId,
                        userIdSecond: friendToDeleteId,
                    }
                });
                return 'Запрос успешно удален';
            }

            // Если были друзьями
            request.userIdFirst = friendToDeleteId;
            request.userIdSecond = initiatorId;
        }

        request.status = FriendRequestStatus.Subscriber;
        request.save();
        return 'Пользователь удален из друзей.'
    }

    async getFriends(userId: string) {
        return await this.friendRequestRepository.findAll({
            where: {
                status: FriendRequestStatus.Friend,
                [Op.or]: [{ userIdFirst: userId }, { userIdSecond: userId }]
            }
        });
    }

    async getSubscribers(userId: string) {
        return await this.friendRequestRepository.findAll({
            where: {
                status: FriendRequestStatus.Subscriber,
                userIdSecond: userId
            }
        });
    }

    async getSubscripiants(userId: string) {
        return await this.friendRequestRepository.findAll({
            where: {
                status: FriendRequestStatus.Subscriber,
                userIdFirst: userId
            }
        });
    }

    async checkIfFriends(firstUserId: string, secondUserId: string) {
        const friendRequest = await this.friendRequestRepository.findOne({
            where: {
                [Op.or]: [
                    {
                        userIdFirst: firstUserId,
                        userIdSecond: secondUserId,
                    },
                    {
                        userIdFirst: secondUserId,
                        userIdSecond: firstUserId,
                    }
                ]
            }
        });

        return !!friendRequest && friendRequest.status === FriendRequestStatus.Friend;
    }
}