import { Controller, Get, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { UserInteceptor } from "src/auth/interceptor";


@UseGuards(JwtModule)
@UseInterceptors(UserInteceptor)
@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    @ApiOperation({ summary: 'Метод для получения уведомлений.' })
    @Get('')
    async getNotification(
        @Req() request
    ) {
        return await this.notificationService.getNotifications(request.userId);
    }
}