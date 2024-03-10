import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';

import { User } from './user.model';
import { ChangeUserInfoDTO, CreateUserDTO, GetUserByEmailDTO, GetUserByLoginDTO, GetUserDTO, GetUsersBySearchDTO } from './user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User) private userRepository: typeof User) { }

    async createUser(newUser: CreateUserDTO) {
        const userWithId = { ...newUser, id: uuidv4() }
        const createdUser = await this.userRepository.create(userWithId);
        // TO DO: create wishlists: private, public, planner, antiwishlist
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
        })
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

    async changeUserInfo(userInfo: ChangeUserInfoDTO) {
        //const user = await this.userRepository.
    }

    async getUsersBySearch(search: GetUsersBySearchDTO) {
        const users = this.userRepository.findAll({
            where: {
                login: `%${search.input}%`
            }
        })
    }
}
