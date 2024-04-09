import { InjectModel } from "@nestjs/sequelize";
import { ForbiddenException, Injectable } from "@nestjs/common";

import { Reservation } from "./reservation.model";
import { FriendshipService } from "src/friendship/friends.service";
import { GiftService } from "src/gift/gift.service";


@Injectable()
export class ReservationService {
    constructor(@InjectModel(Reservation) private reservationRepository: typeof Reservation,
        private friendshipService: FriendshipService,
        private giftService: GiftService,
    ) { }

    private async hasAcceess(userId: string, giftCreatorId: string) {
        const areFriends = await this.friendshipService.checkIfFriends(userId, giftCreatorId);
        if (!areFriends) {
            throw new ForbiddenException('Пользователи не являются друзьями.');
        }
    }


    async reserveGift(userId: string, giftId: string) {
        const gift = await this.giftService.getGiftInfo(giftId);

        await this.hasAcceess(userId, gift.userId);

        const reservation = await this.reservationRepository.findOne({
            where: {
                userId: userId,
                giftId: giftId
            }
        });

        if (reservation) {
            return 'Подарок уже зарезервирован пользователем.';
        }

        await this.reservationRepository.create({
            userId: userId,
            giftId: giftId
        });

        return 'Подарок зарезервирован.';
    }


    async getGiftReservations(userId: string, giftId: string) {
        const gift = await this.giftService.getGiftInfo(giftId);

        await this.hasAcceess(userId, gift.userId);

        return await this.reservationRepository.findAll({
            where: {
                giftId: gift.id
            }
        });
    }

    async getReservations(userId: string) {
        return await this.reservationRepository.findAll({
            where: {
                userId: userId
            }
        })
    }

    async removeReservation(userId: string, giftId: string) {
        const reservation = await this.reservationRepository.findOne({
            where: {
                userId: userId,
                giftId: giftId
            }
        });

        reservation.destroy();
    }
}