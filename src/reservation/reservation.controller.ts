import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ReservationService } from "./reservation.service";
import { UserInteceptor } from "src/auth/interceptor";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";


@UseInterceptors(UserInteceptor)
@ApiTags('Reservation')
@Controller('reservation')
export class ReservationController {
    constructor(private reservationService: ReservationService) { }


    @ApiOperation({ summary: 'Резервирование подарка.' })
    @ApiResponse({ status: 200, description: 'Подарок зарезервирован.' })
    @ApiResponse({ status: 403, description: 'Пользователь и владелец подарка не друзья.' })
    @Post()
    async reserveGift(
        @Req() request,
        @Body() body: { giftId: string, guest?: { guestName: string, guestId?: string } }
    ) {
        if (request.userId) {
            await this.reservationService.reserveGift(request.userId, body.giftId);
        }
        if (body.guest) {
            const result = await this.reservationService.reserveGiftByGuest(body.guest, body.giftId);
            return {
                guestId: result
            };
        }
    }


    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'Получение зарезервированных подарков.' })
    @Get('reservations')
    async getReservations(
        @Req() request
    ) {
        return await this.reservationService.getReservations(request.userId);
    }


    @ApiOperation({ summary: 'Отмена резервирования подарка.' })
    @ApiResponse({ status: 200, description: 'Резервирование отменено.' })
    @ApiResponse({ status: 403, description: 'Пользователь и владелец подарка не друзья.' })
    @Delete()
    async removeReservation(
        @Req() request,
        @Body() body: { giftId: string, guestId?: string }
    ) {
        if (request.userId) {
            return await this.reservationService.removeReservation(request.userId, body.giftId);
        }
        if (body.guestId) {
            return await this.reservationService.removeReservationOfGuest(body.guestId, body.giftId);
        }
    }


    @ApiOperation({ summary: 'Получение пользователей, которые зарезервировали подарки.' })
    @Get(':giftId')
    async getGiftReservations(
        @Req() request,
        @Param('giftId') giftId
    ) {
        return await this.reservationService.getGiftReservations(request.userId, giftId);
    }
}