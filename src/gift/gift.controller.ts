import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { GiftService } from "./gift.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "src/auth/jwt-auth.guard";
import { ChangeGiftInfoDTO } from "./gift.dto";
import { UserInteceptor } from "src/auth/interceptor";
import { FileInterceptor } from "@nestjs/platform-express";


@UseInterceptors(UserInteceptor)
@ApiTags('Gift')
@Controller('gift')
export class GiftController {
    constructor(private giftService: GiftService) { }


    @UseInterceptors(FileInterceptor('giftImage'))
    @ApiOperation({ summary: 'Загрузка картинки подарка.' })
    @Post('/uploadImage')
    async uploadGiftImage(
        @Req() request,
        @UploadedFile() giftImage: Express.Multer.File,
        @Body() body: { giftId: string }
    ) {
        return await this.giftService.uploadGiftImage(request.userId, body.giftId, giftImage);
    }


    @ApiOperation({ summary: 'Изменение информации подарка.' })
    @ApiResponse({ status: 200 })
    @UseGuards(JWTAuthGuard)
    @Patch(':id')
    async changeGiftInfo(
        @Req() request,
        @Param('id') id: string,
        @Body() giftInfo: ChangeGiftInfoDTO
    ) {
        await this.giftService.changeGiftInfo(request.userId, id, giftInfo);
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
        await this.giftService.deleteGift(request.userId, id);
    }

}