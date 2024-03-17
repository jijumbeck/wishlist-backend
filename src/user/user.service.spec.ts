import { TestBed } from '@automock/jest';
import { BadRequestException } from "@nestjs/common";
import { getModelToken } from '@nestjs/sequelize';

import { UserService } from "./user.service";
import { CreateUserDTO } from "./user.dto";
import { User } from "./user.model";
import { Op } from 'sequelize';

const usersStorage = [];
const mockUserRepository = {
    users: new Array<User>(),
    create: function (newUser: { id: string, email: string, login: string }) {
        const userToAdd = {
            id: newUser.id,
            email: newUser.email,
            login: newUser.login,
            name: null,
            lastName: null,
            birthdate: null
        }
        usersStorage.push(userToAdd);
        return userToAdd;
    },
    findByPk: function (id) {
        return usersStorage.find(user => user.id === id);
    },
    findOne: function (options) {
        return usersStorage.find(user => {
            for (let key in options.where) {
                if (user[key] !== options.where[key]) {
                    return false;
                }
            }
            return true;
        });
    },
    findAll: function (options) {
        const array = [];
        const searchInput = options.where.login[Op.like];
        const substring = searchInput.substring(1, searchInput.length - 1);

        for (let i = 0; i < usersStorage.length; ++i) {
            if (usersStorage[i].login.includes(substring)) {
                array.push(usersStorage[i]);
            }
        }
        return array;
    }
}


describe('User Service', () => {
    let userService: UserService;
    let userRepository: jest.Mocked<User>
    const userRepositoryToken = getModelToken(User);

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(UserService)
            .mock(userRepositoryToken)
            .using(mockUserRepository)
            .compile();
        userService = unit;
        userRepository = unitRef.get(userRepositoryToken);
    });

    it("service should be defined", () => {
        expect(userService).toBeDefined();
    });

    it("repository should be defined", () => {
        expect(userRepository).toBeDefined();
    });

    describe("createUser", () => {

        test("if 'createUser' creates user and return it when there is no user with such email or login", async () => {
            // Arrange
            const newUser: CreateUserDTO = {
                email: "creating@example.com",
                login: "creating"
            }

            // Act
            const user = await userService.createUser(newUser);

            // Assert
            expect(user).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    email: newUser.email,
                    login: newUser.login,
                    name: null,
                    lastName: null,
                    birthdate: null
                }));
        });

        test("if 'createUser' throws BadRequestException on user with same email", async () => {
            // Arrange
            const newUser: CreateUserDTO = {
                email: "throwonemail@example.com",
                login: "throwonemail1"
            }
            const userOne = await userService.createUser(newUser);

            const newUserWithSameEmail: CreateUserDTO = {
                email: newUser.email,
                login: "throwonemail2"
            }

            // Act
            async function act() {
                const userTwo = await userService.createUser(newUserWithSameEmail);
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });

        test("if 'createUser' throws BadRequestException on user with same login", async () => {
            // Arrange
            const newUser: CreateUserDTO = {
                email: "throwonlogin@example.com",
                login: "throwonlogin1"
            }
            const userOne = await userService.createUser(newUser);

            const newUserWithSameLogin: CreateUserDTO = {
                email: "throwonlogin@example.com",
                login: newUser.login
            }

            // Act
            async function act() {
                const userTwo = await userService.createUser(newUserWithSameLogin);
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });
    });

    describe('getUser', () => {
        test("if 'getUser' returns same user that was created", async () => {
            // Arrange
            const newUser: CreateUserDTO = {
                email: "getUser@example.com",
                login: "getUser"
            }
            const createdUser = await userService.createUser(newUser);

            // Act
            const user = await userService.getUser({ id: createdUser.id });

            // Assert
            expect(user).toMatchObject(createdUser);
        });
    });


    describe('getUserByEmail', () => {
        test("if 'getUserByEmail' returns same user that was created", async () => {
            // Arrange
            const newUser: CreateUserDTO = {
                email: "getUserByEmail@example.com",
                login: "getUserByEmail"
            }
            const createdUser = await userService.createUser(newUser);

            // Act
            const user = await userService.getUserByEmail({ email: newUser.email });

            // Assert
            expect(user).toMatchObject(createdUser);
        });
    });

    describe('getUserByLogin', () => {
        test("if 'getUserByLogin' returns same user that was created", async () => {
            // Arrange
            const newUser: CreateUserDTO = {
                email: "getUserByLogin@example.com",
                login: "getUserByLogin"
            }
            const createdUser = await userService.createUser(newUser);

            // Act
            const user = await userService.getUserByLogin({ login: newUser.login });

            // Assert
            expect(user).toMatchObject(createdUser);
        });
    });

    describe('changeUserInfo', () => {
        test("if 'changeUserInfo' throws BadRequestException on attempting change email with existing email", async () => {
            // Arrange
            const newUserOne: CreateUserDTO = {
                email: "changeUserInfo1@example.com",
                login: "changeUserInfo1"
            };
            const newUserTwo: CreateUserDTO = {
                email: "changeUserInfo2@example.com",
                login: "changeUserInfo2"
            }
            const createdUser1 = await userService.createUser(newUserOne);
            const createdUser2 = await userService.createUser(newUserTwo);

            // Act
            async function act() {
                const user = await userService.changeUserInfo(createdUser2.id, {
                    email: newUserOne.email,
                });
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });

        test("if 'changeUserInfo' throws BadRequestException on attempting change login with existing login", async () => {
            // Arrange
            const newUserOne: CreateUserDTO = {
                email: "changeUserInfo3@example.com",
                login: "changeUserInfo3"
            };
            const newUserTwo: CreateUserDTO = {
                email: "changeUserInfo4@example.com",
                login: "changeUserInfo4"
            }
            const createdUser1 = await userService.createUser(newUserOne);
            const createdUser2 = await userService.createUser(newUserTwo);

            // Act
            async function act() {
                const user = await userService.changeUserInfo(createdUser2.id, {
                    login: newUserOne.login,
                });
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });
    });

    describe('getUsersBySearch', () => {
        test("if 'getUsersBySearch' returns all users that match patter", async () => {
            // Arrange
            const newUserOne: CreateUserDTO = {
                email: "getUsersBySearch1@example.com",
                login: "getUsersBySearch1"
            };
            const newUserTwo: CreateUserDTO = {
                email: "getUsersBySearch2@example.com",
                login: "getUsersBySearch2"
            }
            const createdUser1 = await userService.createUser(newUserOne);
            const createdUser2 = await userService.createUser(newUserTwo);

            // Act
            const firstUsers = await userService.getUsersBySearch({ input: 'BySearch' });
            const secondUsers = await userService.getUsersBySearch({ input: 'BySearch2' });

            // Assert
            expect(firstUsers.length).toBe(2);
            expect(firstUsers[0]).toMatchObject(createdUser1);
            expect(firstUsers[1]).toMatchObject(createdUser2);

            expect(secondUsers.length).toBe(1);
            expect(secondUsers[0]).toMatchObject(createdUser2);
        })
    });
});