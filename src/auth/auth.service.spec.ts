import { TestBed } from "@automock/jest";
import { getModelToken } from "@nestjs/sequelize";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { Auth } from "./auth.model";
import { CreateUserDTO } from "src/user/user.dto";
import { BadRequestException } from "@nestjs/common";
import { User } from "src/user/user.model";


const mockUserService = {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByLogin: jest.fn()
}


const data = [];
const mockAuthRepository = {
    create: function (params: { userId: string, passwordHash: string }) {
        data.push(params);
    },
    findOne: function (options) {
        return data.find(user => {
            for (let key in options.where) {
                if (user[key] !== options.where[key]) {
                    return false;
                }
            }
            return true;
        });
    },
    update: jest.fn()
}

// function (newUser: CreateUserDTO) {
//     const user = {
//         id: 1,
//         email: newUser.email,
//         login: newUser.login,
//     }
//     return user;
// }

describe('Auth service', () => {
    let authService: AuthService;

    let userService: jest.Mocked<UserService>;
    let authRepository: jest.Mocked<Auth>
    const authRepositoryToken = getModelToken(Auth);
    let jwtService: JwtService;

    beforeEach(async () => {
        jwtService = new JwtService();

        const { unit, unitRef } = TestBed.create(AuthService)
            .mock(UserService)
            .using(mockUserService)
            .mock(authRepositoryToken)
            .using(mockAuthRepository)
            .mock(JwtService)
            .using(jwtService)
            .compile();

        authService = unit;

        userService = unitRef.get(UserService);
        authRepository = unitRef.get(authRepositoryToken);
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
        expect(userService).toBeDefined();
        expect(authRepository).toBeDefined();
        expect(jwtService).toBeDefined();
    })

    describe('registerUser', () => {
        test('if registerUser creates user that is not registered', async () => {
            // Arrange
            const newUser = {
                email: "example@example.com",
                login: "example",
                password: "123456"
            }
            userService.createUser.mockImplementation(async (newUser: CreateUserDTO) => {
                return {
                    id: 1,
                    email: newUser.email,
                    login: newUser.login,
                    name: null,
                    lastName: null,
                    birthdate: null
                } as unknown as User;
            });

            // Act
            const tokens = await authService.registerUser(newUser);
            const userFromAccess = jwtService.verify((tokens.accessToken));
            const userFromRefresh = jwtService.verify((tokens.refreshToken));
            const userFromAuthRepository = data.find(user => user.userId === userFromAccess.user.userId);

            // Assert
            expect(data.length).toBe(1);
            expect(userFromAuthRepository).not.toBeNull();
            expect(userFromAccess.user.userId).toBe(userFromRefresh.user.userId);
            expect(userFromAuthRepository.userId).toBe(userFromRefresh.user.userId);
        });
    });


    describe('login', () => {
        test("if login correctly checks password hashes", async () => {
            // Arrange
            const user = {
                email: "example@example.com",
                login: "example",
                password: "123456"
            }
            userService.getUserByEmail.mockResolvedValue(null);
            userService.getUserByLogin.mockResolvedValue(null);
            userService.createUser.mockImplementation(async (newUser: CreateUserDTO) => {
                return {
                    id: 1,
                    email: newUser.email,
                    login: newUser.login,
                    name: null,
                    lastName: null,
                    birthdate: null
                } as unknown as User;
            });
            await authService.registerUser(user);

            // Act
            const tokens = await authService.login({ emailOrLogin: user.email, password: user.password });
            const userFromAccess = jwtService.verify((tokens.accessToken));
            const userFromRefresh = jwtService.verify((tokens.refreshToken));
            const userFromAuthRepository = data.find(user => user.userId === userFromAccess.user.userId);

            // Assert
            expect(userFromAccess.user.userId).toBe(userFromRefresh.user.userId);
            expect(userFromAuthRepository.userId).toBe(userFromRefresh.user.userId);
        });

        test("if login throws error on incorrect password", async () => {
            // Arrange
            const user = {
                email: "example@example.com",
                login: "example",
                password: "123456"
            }
            userService.createUser.mockImplementation(async (newUser: CreateUserDTO) => {
                return {
                    id: 1,
                    email: newUser.email,
                    login: newUser.login,
                    name: null,
                    lastName: null,
                    birthdate: null
                } as unknown as User;
            });
            await authService.registerUser(user);

            const incorrectCredentials = {
                emailOrLogin: "example@example.com",
                password: "incorrectPassword"
            }

            // Act
            async function act() {
                const tokens = await authService.login(incorrectCredentials);
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });

        test('if login throws error on non-existing user with email', async () => {
            // Arrange
            const user = {
                emailOrLogin: "nonexistingexample@example.com",
                password: "123456"
            };
            userService.getUserByEmail.mockResolvedValue(null);
            userService.getUserByLogin.mockResolvedValue(null);

            // Act
            async function act() {
                const tokens = await authService.login(user);
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });

        test('if login throws error on non-existing user with login', async () => {
            // Arrange
            const user = {
                emailOrLogin: "nonexistinglogin",
                password: "123456"
            };
            userService.getUserByEmail.mockResolvedValue(null);
            userService.getUserByLogin.mockResolvedValue(null);

            // Act
            async function act() {
                const tokens = await authService.login(user);
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
        });
    });
});