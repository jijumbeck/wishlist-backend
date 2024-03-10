import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Auth } from './auth.model';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'VERY_SECRET_KEY',
            signOptions: {
                expiresIn: '12h'
            }
        }),
        SequelizeModule.forFeature([Auth])
    ]
})
export class AuthModule { }
