import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { Auth } from './auth.model';
import { User } from 'src/user/user.model';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        forwardRef(() => UserModule),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'VERY_SECRET_KEY',
            signOptions: {
                expiresIn: '12h'
            }
        }),
        SequelizeModule.forFeature([Auth, User])
    ],
    exports: [
        AuthService,
        JwtModule
    ]
})
export class AuthModule { }
