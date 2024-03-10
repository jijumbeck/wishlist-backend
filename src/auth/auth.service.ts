import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Auth } from './auth.model';
import { LoginCredentials, RegisterCredentials, Tokens } from './auth.dto';
import { User } from 'src/user/user.model';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        @InjectModel(Auth) private authRepository: typeof Auth,
        private jwtService: JwtService) { }

    async registerUser(registerCredentials: RegisterCredentials) {
        // Find User
        const userByEmail = await this.userService.getUserByEmail({ email: registerCredentials.email });
        const userByLogin = await this.userService.getUserByLogin({ login: registerCredentials.login });

        // if (user) --> Exception
        if (userByEmail) {
            throw new BadRequestException('Пользователь с таким email уже зарегистрирован.');
        }
        if (userByLogin) {
            throw new BadRequestException('Пользователь с таким логином уже зарегистрирован.');
        }

        // Create User
        const user = await this.userService.createUser(registerCredentials);

        // Create Auth
        const passwordHash = await bcrypt.hash(registerCredentials.password, 5);
        const auth = await this.authRepository.create({
            userId: user.id,
            passwordHash: passwordHash
        });

        // Generate tokens
        return this.generateTokens({ id: user.id })
    }

    async login(loginCredentials: LoginCredentials) {
        // Data validation


        // Find User (or exception if does not exist)
        

        // Find Auth credentials


        // Check Auth credentials with LoginCredentials (or exception)


        // Generate tokens


        // return tokens
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
}
