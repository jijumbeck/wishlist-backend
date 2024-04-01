import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { Auth } from './auth.model';
import { LoginCredentials, RegisterCredentials, Tokens } from './auth.dto';
import { UserService } from 'src/user/user.service';
import { isEmail } from './auth.schema';
import { User } from 'src/user/user.model';


@Injectable()
export class AuthService {
    declare salt: number;

    constructor(private userService: UserService,
        @InjectModel(Auth) private authRepository: typeof Auth,
        private jwtService: JwtService) {
        this.salt = Number(process.env.BCRYPT_SECRET_HASH);
    }

    async registerUser(registerCredentials: RegisterCredentials) {
        // Create User
        const user = await this.userService.createUser(registerCredentials);

        // Create Auth
        const passwordHash = await bcrypt.hash(registerCredentials.password, this.salt);
        const auth = await this.authRepository.create({
            userId: user.id,
            passwordHash: passwordHash
        });

        // Generate tokens
        return this.generateTokens({ id: user.id })
    }

    async login(loginCredentials: LoginCredentials) {
        const isLoginByEmail = isEmail(loginCredentials.emailOrLogin);

        // Find User (or exception if does not exist)
        let user: User | null = null;

        if (isLoginByEmail) {
            user = await this.userService.getUserByEmail({ email: loginCredentials.emailOrLogin });
        } else {
            user = await this.userService.getUserByLogin({ login: loginCredentials.emailOrLogin });
        }

        if (!user) {
            throw new BadRequestException(`Пользователь с таким ${isLoginByEmail ? "email" : "логином"} не зарегистрирован.`);
        }

        // Find Auth credentials
        const authCredentials = await this.authRepository.findOne({
            where: {
                userId: user.id
            }
        });

        // Check Auth credentials with LoginCredentials (or exception)
        const passwordEquals = await bcrypt.compare(loginCredentials.password, authCredentials.passwordHash);
        if (!passwordEquals) {
            throw new BadRequestException("Пароль неправильный.");
        }

        // Generate tokens
        return this.generateTokens({ id: user.id })
    }

    async changePassword(userId: string, newPassword: string) {
        const user = await this.authRepository.findOne({
            where: {
                userId: userId
            }
        });

        if (!user) {
            throw new BadRequestException("Пользователь с таким id не существует.");
        }

        const passwordHash = await bcrypt.hash(newPassword, this.salt);
        user.passwordHash = passwordHash;
        user.save();
    }

    async refresh(refreshToken: string) {
        try {
            const user = this.jwtService.verify(refreshToken);
            const accessToken = this.jwtService.sign({ id: user.id });
            return accessToken;
        } catch (e) {
            throw new UnauthorizedException("Невалидный refresh токен.");
        }
    }

    private async generateTokens(userInfo: { id: string }): Promise<Tokens> {
        const payload = userInfo;
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, {
                expiresIn: '30d'
            })
        }
    }

    private async hashPassword(password: string) {
        try {
            return await bcrypt.hash(password, process.env.BCRYPT_SECRET_HASH || 5);
        } catch (e) {
            console.log(e);
        }
    }
}
