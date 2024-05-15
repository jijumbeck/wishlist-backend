import { Body, Controller, Post } from "@nestjs/common";
import { EmailService } from "./email.service";


@Controller('email')
export class EmailController {
    constructor(private emailService: EmailService) { }

    @Post()
    async sendEmail(
        @Body() body: { to: string, text: string, subject?: string }
    ) {
        return await this.emailService.sendEmail(body.to, { text: body.text, subject: body.subject });
    }
}