import { TestBed } from "@automock/jest";
import { getModelToken } from "@nestjs/sequelize";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { Auth } from "./auth.model";
import { CreateUserDTO } from "src/user/user.dto";
import { User } from "src/user/user.model";
import { UserService } from "src/user/user.service";

// Mocks

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

// Tests

describe('Auth service', () => {
    let authService: AuthService;

    let userService: jest.Mocked<UserService>;
    let authRepository: jest.Mocked<Auth>
    const authRepositoryToken = getModelToken(Auth);
    let jwtService: JwtService;

    beforeEach(async () => {
        jwtService = new JwtService({
            secret: "test",
            secretOrPrivateKey: "test",
            signOptions: {
                expiresIn: '12h'
            }
        });

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
            const userFromAccess = jwtService.verify(tokens.accessToken);
            const userFromRefresh = jwtService.verify(tokens.refreshToken);
            const userFromAuthRepository = data.find(user => user.userId === userFromAccess.id);

            // Assert
            expect(data.length).toBe(1);
            expect(userFromAuthRepository).not.toBeNull();
            expect(userFromAccess.id).toBe(userFromRefresh.id);
            expect(userFromAuthRepository.userId).toBe(userFromRefresh.id);
        });
    });


    describe('login', () => {
        beforeEach(() => {
            while (data.length > 0) {
                data.pop();
            }
        });

        test("if login correctly checks password hashes", async () => {
            // Arrange
            const user = {
                email: "example@example.com",
                login: "example",
                password: "123456"
            }
            userService.getUserByEmail
                .mockResolvedValue({
                    id: 1,
                    email: user.email,
                    login: user.login,
                    name: null,
                    lastName: null,
                    birthdate: null
                } as unknown as User);
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
            const userFromAccess = jwtService.verify(tokens.accessToken);
            const userFromRefresh = jwtService.verify(tokens.refreshToken);
            const userFromAuthRepository = data.find(user => user.userId === userFromAccess.id);

            // Assert
            expect(userFromAccess.id).toBe(userFromRefresh.id);
            expect(userFromAuthRepository.userId).toBe(userFromRefresh.id);
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
            await expect(act()).rejects.toThrow(/Пароль неправильный/);
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
            await expect(act()).rejects.toThrow(/email/);
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
            await expect(act()).rejects.toThrow(/логин/);
        });
    });
});