export class RegisterCredentials {
    readonly email: string;
    readonly login: string;
    readonly password: string;
}

export class LoginCredentials {
    readonly emailOrLogin: string;
    readonly password: string;
}

export class Tokens {
    readonly accessToken: string;
    readonly refreshToken: string;
}