import { InjectModel } from "@nestjs/sequelize";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';

import { Reservation } from "./reservation.model";
import { GiftService } from "src/gift/gift.service";
import { GuestReservation } from "./guestReservation.model";
import { WishlistService } from "src/wishlist/wishlist.service";
import { EmailService } from "src/email/email.service";
import { UserService } from "src/user/user.service";
import { Op, QueryTypes } from "sequelize";
import { Gift } from "src/gift/gift.model";
import sequelize from "sequelize";



@Injectable()
export class ReservationService {
    constructor(
        @InjectModel(Reservation) private reservationRepository: typeof Reservation,
        @InjectModel(GuestReservation) private guestReservationRepository: typeof GuestReservation,
        private giftService: GiftService,
        private wishlistService: WishlistService,
        private emailService: EmailService,
        private userService: UserService
    ) { }

    private async notifyAboutReservation(gift: Gift, userId: string) {
        const reservations = await this.reservationRepository
            .findAll({
                where: {
                    giftId: gift.id,
                    userId: { [Op.not]: userId }
                }
            });
        const userIds = reservations.map(reservation => reservation.userId);

        const giftOwner = await this.userService.getUser({ id: gift.userId });

        userIds.forEach(async (userId) => {
            const user = await this.userService.getUser({ id: userId });
            this.emailService.sendEmail(
                user.email,
                {
                    text: `
                        Вы зарезервировали подарок ${gift.title} для ${giftOwner.login}.
                        Вы получили это письмо, потому что этот подарок был зарезервирован другим пользователем.
                        Для полной информации Вы можете перейти по ссылке: ${process.env.CLIENT_APP_HOST}/${gift.userId}/${gift.wishlistId}/${gift.id}
                    `,
                    subject: 'Бронирование подарка'
                }
            )
        });
    }

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


        this.notifyAboutReservation(gift, userId);
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

        const gift = await this.giftService.getGiftInfo(giftId);

        await this.guestReservationRepository.create({
            guestId: guestId,
            guestName: guest.guestName,
            giftId: giftId
        });

        this.notifyAboutReservation(gift, '');

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

    async updateReservations(userId: string, guestId: string) {
        const reservations = await this.guestReservationRepository.findAll({
            where: {
                guestId: guestId
            }
        });

        for (let i = 0; i < reservations.length; ++i) {
            const reservation = await this.reservationRepository.findOne({
                where: {
                    giftId: reservations[i].giftId,
                    userId: userId
                }
            });

            if (!reservation) {
                await this.reservationRepository.create({
                    userId: userId,
                    giftId: reservations[i].giftId
                });
            }

            reservations[i].destroy();
        }
    }

    async getCountOfFriendWithReservations(userId: string) {
        const users = await this.reservationRepository.sequelize.query(
            `SELECT DISTINCT "userId" FROM public.reservation
            WHERE public.reservation."giftId" in (SELECT "id" FROM public.gifts WHERE "userId" = '${userId}')
            `,
            { type: QueryTypes.SELECT }
        );

        const guests = await this.guestReservationRepository.sequelize.query(
            `SELECT DISTINCT "guestId" FROM public."guestReservation"
            WHERE public."guestReservation"."giftId" in (SELECT "id" FROM public.gifts WHERE "userId" = '${userId}')`,
            { type: QueryTypes.SELECT }
        )

        return users.length + guests.length;
    }
}