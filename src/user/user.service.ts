import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

import { User } from './user.model';
import { ChangeUserInfoDTO, CreateUserDTO, GetUserByEmailDTO, GetUserByLoginDTO, GetUserDTO, GetUsersBySearchDTO, UserInfo } from './user.dto';
import { WishlistService } from 'src/wishlist/wishlist.service';
import { Readable } from 'stream';
import { createReadStream } from 'fs';
import { EntityType, FileService } from 'src/file/file.service';


@Injectable()
export class UserService {
    constructor(@InjectModel(User) private userRepository: typeof User,
        private wishlisService: WishlistService,
        private fileService: FileService
    ) { }

    async createUser(newUser: CreateUserDTO) {
        // Find User
        const userByEmail = await this.getUserByEmail({ email: newUser.email });
        const userByLogin = await this.getUserByLogin({ login: newUser.login });

        // if (user) --> Exception
        if (userByEmail) {
            throw new BadRequestException('Пользователь с таким email уже зарегистрирован.');
        }
        if (userByLogin) {
            throw new BadRequestException('Пользователь с таким логином уже зарегистрирован.');
        }

        const userWithId = { ...newUser, id: uuidv4() }
        const createdUser = await this.userRepository.create(userWithId);

        await this.wishlisService.createWishlistsForUser(createdUser.id);

        return createdUser;
    }


    async getUser(userToGet: GetUserDTO) {
        const user = await this.userRepository.findByPk(userToGet.id);
        return user;
    }


    async getUserByEmail(userToGet: GetUserByEmailDTO) {
        const user = await this.userRepository.findOne({
            where: {
                email: userToGet.email
            }
        });
        return user;
    }


    async getUserByLogin(userToGet: GetUserByLoginDTO) {
        const user = await this.userRepository.findOne({
            where: {
                login: userToGet.login
            }
        })
        return user;
    }


    async changeUserInfo(userId: string, userInfo: ChangeUserInfoDTO) {
        const user = await this.getUser({ id: userId });

        if (userInfo.email && userInfo.email !== user.email) {
            const userWithSuchEmail = await this.getUserByEmail({ email: userInfo.email });
            if (userWithSuchEmail) {
                throw new BadRequestException("Пользователь с таким email уже зарегистрирован.");
            }
        }

        if (userInfo.login && userInfo.login !== user.login) {
            const userWithSuchLogin = await this.getUserByLogin({ login: userInfo.login });
            if (userWithSuchLogin) {
                throw new BadRequestException("Пользователь с таким логином уже зарегистрирован.");
            }
        }

        user.set(userInfo);

        await user.save();
    }


    async getUsersBySearch(search: GetUsersBySearchDTO) {
        const users = this.userRepository.findAll({
            where: {
                login: { [Op.like]: `%${search.input}%` }
            }
        });
        return users;
    }


    async changeUserImage(userId: string, file: Express.Multer.File) {
        const user = await this.userRepository.findByPk(userId);
        if (!user) {
            throw new BadRequestException('Пользователя с таким id не существует.');
        }

        await this.fileService.createFile(EntityType.userImage, userId, file);
    }

    async getUserImage(userId: string) {
        
    }
}
