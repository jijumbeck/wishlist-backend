import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCredentials, RegisterCredentials } from './auth.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RegistrationValidationPipe } from './validation.pipe';
import { registerCredentialsSchema } from './auth.schema';
import { JWTAuthGuard } from './jwt-auth.guard';


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
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

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
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.send(
            'Пользователь успешно зарегистрирован.'
        )
    }

    @ApiOperation({ summary: 'Изменение пароля пользователя.' })
    @ApiResponse({ status: 200, description: "Пароль успешно изменен." })
    @ApiResponse({ status: 400, description: "Слабый пароль." })
    @UseGuards(JWTAuthGuard)
    @Post('change-password')
    async changePassword(
        @Req() req,
        @Body() credentials: { newPassword: string }
    ) {
        return this.authService.changePassword(req.user.id, credentials.newPassword);
    }

    @ApiOperation({ summary: 'Обновление access токена.' })
    @ApiResponse({ status: 200, description: 'Access токен успешно обновлен.' })
    @ApiResponse({ status: 401, description: 'Refresh токен невалиден.' })
    @Post('refresh')
    async refresh(@Req() req, @Res() res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        const accessToken = await this.authService.refresh(refreshToken);
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        res.send(
            'Access токен обновлен.'
        )
    }
}
