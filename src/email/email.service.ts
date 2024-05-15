import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                type: 'login',
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
                // mtscumpnqfjdwkkp
            }
        });

        this.transporter.verify((error, succes) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Server is ready to send messages.');
            }
        });
    }

    async sendEmail(toEmail: string, message: { text: string, subject?: string }) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Wishlist" <wishlist.tech@yandex.ru>', // sender address
                to: toEmail,
                subject: message.subject,
                text: message.text
            });

            console.log("Message sent: %s", info.messageId);
        } catch (e) {
            console.log(e);
        }
    }
}