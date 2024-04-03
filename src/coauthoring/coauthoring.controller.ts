import { Body, Controller, Post, Req, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CoauthoringService } from "./coauthoring.service";


@UseInterceptors(UseInterceptors)
@ApiTags('Coauthoring')
@Controller('coauthoring')
export class CoauthoringController {
    constructor(private coauthoringService: CoauthoringService) { }

    @ApiOperation({ summary: 'Добавление соавтора/Подтверждение на соавторство.' })
    @Post('/add')
    async addCoauthor(
        @Req() request,
        @Body() body: { coauthorId: string, wishlistId: string }
    ) {
        return await this.coauthoringService.addCoauthor(
            request.userId,
            body.coauthorId,
            body.wishlistId
        );
    }

    @ApiOperation({ summary: 'Удаление соавтора/отказ от соавторства.' })
    @Post('/remove')
    async removeCoauthor(
        @Req() request,
        @Body() body: { coauthorId: string, wishlistId: string }
    ) {
        return await this.coauthoringService.removeCoauthor(
            request.userId,
            body.coauthorId,
            body.wishlistId
        );
    }
}