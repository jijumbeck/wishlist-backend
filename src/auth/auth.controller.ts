import { Body, Controller, Get, Post, Res, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCredentials, RegisterCredentials } from './auth.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RegistrationValidationPipe } from './validation.pipe';
import { registerCredentialsSchema } from './auth.schema';


@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Авторизация пользователя.' })
    @ApiResponse({ status: 200 })
    @Post('/login')
    async login(
        @Body() credentials: LoginCredentials,
        @Res() res: Response) {

        const { accessToken, refreshToken } = await this.authService.login(credentials);
        res.cookie('accessToken', accessToken, {
            httpOnly: true
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true
        })

        res.send(
            'Пользователь успешно авторизовался.'
        )
    }

    @ApiOperation({ summary: 'Регистрация пользователя.' })
    @ApiResponse({ status: 200, description: "Пользователь успешно зарегистрирован." })
    @ApiResponse({ status: 400, description: "Введенные данные невалидны." })
    @ApiResponse({ status: 400, description: "Пользователь с таким email/логином уже существует." })
    @UsePipes(new RegistrationValidationPipe(registerCredentialsSchema))
    @Post('/register')
    async register(
        @Body() credentials: RegisterCredentials,
        @Res() res: Response) {

        const { accessToken, refreshToken } = await this.authService.registerUser(credentials);
        res.cookie('accessToken', accessToken, {
            httpOnly: true
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true
        })

        res.send(
            'Пользователь успешно зарегистрирован.'
        )
    }
}
