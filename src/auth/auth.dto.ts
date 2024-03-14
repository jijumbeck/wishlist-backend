import { ApiProperty } from "@nestjs/swagger";

export class RegisterCredentials {
    @ApiProperty({ example: 'example@email.com', description: 'Email пользователя' })
    readonly email: string;

    @ApiProperty({ example: 'login', description: 'Уникальный логин пользователя' })
    readonly login: string;

    @ApiProperty({ description: 'Пароль пользователя.' })
    readonly password: string;
}

export class LoginCredentials {
    @ApiProperty({ example: 'example@email.com', description: 'Email или логин пользователя.' })
    readonly emailOrLogin: string;

    @ApiProperty({ description: 'Пароль пользователя.' })
    readonly password: string;
}

export class Tokens {
    @ApiProperty({ description: 'Access токен, по которому авторизуется пользователь.' })
    readonly accessToken: string;

    @ApiProperty({ description: 'Refresh токен, по которому аутентифицируется пользователь.' })
    readonly refreshToken: string;
}