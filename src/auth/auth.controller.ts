import { Body, Controller, Post, Req, Res, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCredentials, RegisterCredentials } from './auth.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { passwordSchema, registerCredentialsSchema } from './auth.schema';
import { JWTAuthGuard } from './jwt-auth.guard';
import { ZodValidationPipe } from 'src/validation.pipe';
import { UserInteceptor } from './interceptor';


@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseInterceptors(UserInteceptor)
    @Post('/test')
    async example(
        @Req() req
    ) {
        console.log(req.userId);
    }

    @ApiOperation({ summary: 'Авторизация пользователя.' })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 400, description: "Введенные данные невалидны." })
    @ApiResponse({ status: 400, description: "Пользователь с таким email или login не зарегистрирован." })
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
            {
                message: 'Пользователь успешно авторизовался.'
            }
        )
    }

    @ApiOperation({ summary: 'Регистрация пользователя.' })
    @ApiResponse({ status: 200, description: "Пользователь успешно зарегистрирован." })
    @ApiResponse({ status: 400, description: "Введенные данные невалидны." })
    @ApiResponse({ status: 400, description: "Пользователь с таким email/логином уже существует." })
    @UsePipes(new ZodValidationPipe(registerCredentialsSchema))
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
            {
                message: 'Пользователь успешно зарегистрирован.'
            }
        )
    }

    @ApiOperation({ summary: 'Изменение пароля пользователя.' })
    @ApiResponse({ status: 200, description: "Пароль успешно изменен." })
    @ApiResponse({ status: 400, description: "Слабый пароль." })
    @UsePipes(new ZodValidationPipe(passwordSchema))
    @UseGuards(JWTAuthGuard)
    @Post('change-password')
    async changePassword(
        @Req() req,
        @Body() credentials: { newPassword: string }
    ) {
        return this.authService.changePassword(req.userId, credentials.newPassword);
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
            {
                message: 'Access токен обновлен.'
            }
        )
    }
}
