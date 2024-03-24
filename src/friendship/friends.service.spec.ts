import { getModelToken } from "@nestjs/sequelize";
import { FriendRequest, FriendRequestStatus } from "./friends.model";
import { FriendshipService } from "./friends.service";
import { TestBed } from "@automock/jest";
import { BadRequestException } from "@nestjs/common";


const data = new Array<FriendRequest>();
const mockFriendRepository = {
    findOne: jest.fn(),
    create: function (auth) {
        data.push(auth);
    },
    destroy: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
}

// function (options) {
//     return data.find(user => {
//         for (let key in options.where) {
//             if (user[key] !== options.where[key]) {
//                 return false;
//             }
//         }
//         return true;
//     });
// }

// function (options) {
//     const array = [];
//     const searchInput = options.where.login[Op.like];
//     const substring = searchInput.substring(1, searchInput.length - 1);

//     for (let i = 0; i < data.length; ++i) {
//         if (data[i].login.includes(substring)) {
//             array.push(data[i]);
//         }
//     }
//     return array;
// }


describe('Friendship Service', () => {
    let friendshipService: FriendshipService;
    let friendRepository: jest.Mocked<FriendRequest>
    const friendRepositoryToken = getModelToken(FriendRequest);

    beforeEach(() => {
        const { unit, unitRef } = TestBed.create(FriendshipService)
            .mock(friendRepositoryToken)
            .using(mockFriendRepository)
            .compile();

        friendshipService = unit;
        friendRepository = unitRef.get(friendRepositoryToken);
    });

    it('should be defined', () => {
        expect(friendshipService).toBeDefined();
        expect(friendRepository).toBeDefined();
    });

    describe('addFriend', () => {
        test('if addFriend creates friendship request when users are not friends or subscribers', async () => {
            // Arrange 
            mockFriendRepository.findOne.mockResolvedValue(null);

            // Act
            await friendshipService.addFriend('1', '2');

            // Assert
            const request = data.find(
                (friendRequest) => friendRequest.userIdFirst === '1' && friendRequest.userIdSecond === '2')
            expect(request.status).toBe(FriendRequestStatus.Subscriber);
        });

        test('if addFriend makes users friends when one is subscriber', async () => {
            // Arrange
            mockFriendRepository.findOne.mockResolvedValue({
                userIdFirst: '1',
                userIdSecond: '2',
                status: FriendRequestStatus.Subscriber,
                save: function () {
                    data.pop();
                    data.push(this);
                }
            });

            // Act
            await friendshipService.addFriend('2', '1');

            // Assert
            const request = data.find(
                (friendRequest) => friendRequest.userIdFirst === '1' && friendRequest.userIdSecond === '2')
            expect(request.status).toBe(FriendRequestStatus.Friend);
        });
    });

    describe('deleteFriend', () => {
        beforeEach(() => {
            while (data.length > 0) {
                data.pop();
            }
        });

        test('if deleteFriend makes friendToDelete subscriber when users are friends', async () => {
            // Arrange
            const userIdOne = '1';
            const userIdTwo = '2';
            data.push({
                userIdFirst: userIdOne,
                userIdSecond: userIdTwo,
                status: FriendRequestStatus.Friend,
                save: jest.fn()
            } as unknown as FriendRequest);
            mockFriendRepository.findOne.mockImplementation(async () => {
                return data.find(request => {
                    return (request.userIdFirst === userIdOne && request.userIdSecond === userIdTwo)
                        || (request.userIdFirst === userIdTwo && request.userIdSecond === userIdOne);
                })
            });

            // Act
            await friendshipService.deleteFriend(userIdOne, userIdTwo);
            const request = await mockFriendRepository.findOne();

            // Assert
            expect(request.status).toBe(FriendRequestStatus.Subscriber);
            expect(request.userIdFirst).toBe(userIdTwo);
            expect(request.userIdSecond).toBe(userIdOne);
        });

        test('if deleteFriend makes friendToDelete subscriber when users are friends and userIdTwo is initiator', async () => {
            // Arrange
            const userIdOne = '1';
            const userIdTwo = '2';
            data.push({
                userIdFirst: userIdOne,
                userIdSecond: userIdTwo,
                status: FriendRequestStatus.Friend,
                save: jest.fn()
            } as unknown as FriendRequest);
            mockFriendRepository.findOne.mockImplementation(async () => {
                return data.find(request => {
                    return (request.userIdFirst === userIdOne && request.userIdSecond === userIdTwo)
                        || (request.userIdFirst === userIdTwo && request.userIdSecond === userIdOne);
                })
            });

            // Act
            await friendshipService.deleteFriend(userIdTwo, userIdOne);
            const request = await mockFriendRepository.findOne();

            // Assert
            expect(request.status).toBe(FriendRequestStatus.Subscriber);
            expect(request.userIdFirst).toBe(userIdOne);
            expect(request.userIdSecond).toBe(userIdTwo);
        });

        test('if deleteFriend deletes request when initiator is subscriber', async () => {
            // Arrange
            const userIdOne = '1';
            const userIdTwo = '2';
            data.push({
                userIdFirst: userIdOne,
                userIdSecond: userIdTwo,
                status: FriendRequestStatus.Subscriber,
                save: jest.fn()
            } as unknown as FriendRequest);
            mockFriendRepository.findOne.mockImplementation(async () => {
                return data.find(request => {
                    return (request.userIdFirst === userIdOne && request.userIdSecond === userIdTwo)
                        || (request.userIdFirst === userIdTwo && request.userIdSecond === userIdOne);
                })
            });
            mockFriendRepository.destroy.mockImplementation(async () => {
                const index = data.findIndex(request => {
                    return (request.userIdFirst === userIdOne && request.userIdSecond === userIdTwo)
                        || (request.userIdFirst === userIdTwo && request.userIdSecond === userIdOne);
                });
                data.splice(index, 1);
            });

            // Act
            await friendshipService.deleteFriend(userIdOne, userIdTwo);
            const request = await mockFriendRepository.findOne();

            // Assert
            expect(request).toBeUndefined();
        });

        test('if deleteFriend throws error when users are neither friends or subscribers', async () => {
            // Arrange
            mockFriendRepository.findOne.mockResolvedValue(null);

            // Act
            async function act() {
                await friendshipService.deleteFriend('1', '2');
            }

            // Assert
            await expect(act()).rejects.toThrow(BadRequestException);
            await expect(act()).rejects.toThrow(/Пользователи не друзья/);
        });
    });

    describe('test get methods', () => {
        const userId = '1';
        beforeAll(() => {
            while (data.length > 0) {
                data.pop();
            }

            data.push(
                { userIdFirst: userId, userIdSecond: '2', status: FriendRequestStatus.Friend } as unknown as FriendRequest,
                { userIdFirst: '3', userIdSecond: userId, status: FriendRequestStatus.Friend } as unknown as FriendRequest,
                { userIdFirst: '4', userIdSecond: userId, status: FriendRequestStatus.Subscriber } as unknown as FriendRequest,
                { userIdFirst: userId, userIdSecond: '5', status: FriendRequestStatus.Subscriber } as unknown as FriendRequest,
            );
        })

        describe('getFriends', () => {
            test('if getFiends returns only friends', async () => {
                // Arrange
                mockFriendRepository.findAll.mockImplementation(async () => {
                    return data.filter(value => value.status === FriendRequestStatus.Friend
                        && (value.userIdFirst === userId || value.userIdSecond === userId));
                })

                // Act
                const friends = await friendshipService.getFriends(userId);

                // Assert
                expect(friends.length).toBe(2);
                expect(friends[0].status).toBe(FriendRequestStatus.Friend);
                expect(friends[1].status).toBe(FriendRequestStatus.Friend);
            });
        });

        describe('getSubscribers', () => {
            test('if getSubscribers returns only subscribers', async () => {
                // Arrange
                mockFriendRepository.findAll.mockImplementation(async () => {
                    return data.filter(value => value.status === FriendRequestStatus.Subscriber
                        && value.userIdSecond === userId);
                })

                // Act
                const subscribers = await friendshipService.getSubscribers(userId);

                // Assert
                expect(subscribers.length).toBe(1);
                expect(subscribers[0].status).toBe(FriendRequestStatus.Subscriber);
            });
        });

        describe('getSubscripiants', () => {
            test('if getSubscripiants returns only subscripiants', async () => {
                // Arrange
                mockFriendRepository.findAll.mockImplementation(async () => {
                    return data.filter(value => value.status === FriendRequestStatus.Subscriber
                        && value.userIdFirst === userId);
                })

                // Act
                const subscripiants = await friendshipService.getSubscripiants(userId);

                // Assert
                expect(subscripiants.length).toBe(1);
                expect(subscripiants[0].status).toBe(FriendRequestStatus.Subscriber);
            });
        });
    });
})