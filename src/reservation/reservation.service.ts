import { InjectModel } from "@nestjs/sequelize";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';

import { Reservation } from "./reservation.model";
import { GiftService } from "src/gift/gift.service";
import { GuestReservation } from "./guestReservation.model";
import { WishlistService } from "src/wishlist/wishlist.service";



@Injectable()
export class ReservationService {
    constructor(
        @InjectModel(Reservation) private reservationRepository: typeof Reservation,
        @InjectModel(GuestReservation) private guestReservationRepository: typeof GuestReservation,
        private giftService: GiftService,
        private wishlistService: WishlistService
    ) { }

    async reserveGift(
        userId: string,
        giftId: string
    ): Promise<void | string> {

        const gift = await this.giftService.getGiftInfo(giftId);
        const wishlist = await this.wishlistService.getWishlistInfo(userId, gift.wishlistId);

        const reservation = await this.reservationRepository.findOne({
            where: {
                userId: userId,
                giftId: giftId
            }
        });

        if (reservation) {
            return;
        }

        await this.reservationRepository.create({
            userId: userId,
            giftId: giftId
        });
    }

    async reserveGiftByGuest(
        guest: { guestName: string, guestId?: string },
        giftId: string
    ) {
        const guestId = guest.guestId ?? uuidv4() as string;

        const reservation = await this.guestReservationRepository.findOne({
            where: { guestId: guestId }
        });

        if (reservation) {
            return;
        }

        await this.guestReservationRepository.create({
            guestId: guestId,
            guestName: guest.guestName,
            giftId: giftId
        });

        return guestId;
    }


    async getGiftReservations(userId: string, giftId: string) {
        const gift = await this.giftService.getGiftInfo(giftId);
        const wishlist = await this.wishlistService.getWishlistInfo(userId, gift.wishlistId);

        //await this.hasAcceess(userId, gift.userId);

        const reservations = await this.reservationRepository.findAll({
            where: {
                giftId: gift.id
            }
        });

        const guestReservations = await this.guestReservationRepository.findAll({
            where: {
                giftId: gift.id
            }
        });

        return [...reservations, ...guestReservations];
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

    async removeReservationOfGuest(guestId: string, giftId: string) {
        const reservation = await this.guestReservationRepository.findOne({
            where: {
                guestId: guestId,
                giftId: giftId
            }
        });

        if (reservation) {
            reservation.destroy();
        }
    }
}