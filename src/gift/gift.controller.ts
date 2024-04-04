import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { GiftService } from "./gift.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";
import { ChangeGiftInfoDTO } from "./gift.dto";
import { UserInteceptor } from "src/auth/interceptor";


@UseInterceptors(UserInteceptor)
@ApiTags('Gift')
@Controller('gift')
export class GiftController {
    constructor(private giftService: GiftService) { }

    @ApiOperation({ summary: 'Изменение информации подарка.' })
    @ApiResponse({ status: 200 })
    @UseGuards(JWTAuthGuard)
    @Patch(':id')
    async changeGiftInfo(
        @Req() request,
        @Param('id') id: string,
        @Body() giftInfo: ChangeGiftInfoDTO
    ) {
        return this.giftService.changeGiftInfo(request.userId, id, giftInfo);
    }

    @ApiOperation({ summary: 'Получение информации о подарке.' })
    @ApiResponse({ status: 200 })
    @Get(':id')
    async getGiftInfo(
        @Param('id') id: string
    ) {
        return this.giftService.getGiftInfo(id);
    }

    @ApiOperation({ summary: 'Удаление подарка.' })
    @ApiResponse({ status: 200 })
    @UseGuards(JWTAuthGuard)
    @Delete('/:id')
    async deleteGift(
        @Req() request,
        @Param('id') id: string
    ) {
        return await this.giftService.deleteGift(request.userId, id);
    }

}