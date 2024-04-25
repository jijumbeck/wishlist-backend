import { BadRequestException, ForbiddenException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { v4 as uuidv4 } from 'uuid';

import { Wishlist, WishlistAccessType, WishlistType } from "./wishlist.model";
import { WishlistAccess } from "./wishlist-access.model";
import { ChangeWishlistInfoDTO } from "./wishlist.dto";
import { FriendshipService } from "src/friendship/friends.service";
import { Coauthoring, CoauthoringStatus } from "src/coauthoring/coauthoring.model";
import { GiftService } from "src/gift/gift.service";
import { Op } from "sequelize";
import { WishlistAccessService } from "./wishlist-access.service";
import { CoauthoringService } from "src/coauthoring/coauthoring.service";


@Injectable()
export class WishlistService {
    constructor(@InjectModel(Wishlist) private wishlistRepository: typeof Wishlist,
        @Inject(forwardRef(() => CoauthoringService)) private coauthoringService: CoauthoringService,
        private friendshipService: FriendshipService,
        private giftService: GiftService,
        private wishlistAccessService: WishlistAccessService
    ) { }


    // CRUD operations with wishlists.

    async createWishlist(userId: string) {
        return await this.wishlistRepository.create({
            id: uuidv4(),
            creatorId: userId,
            title: 'Новый вишлист',
            wishlistType: WishlistType.Default,
            wishlistAccess: WishlistAccessType.Private
        });
    }


    async getWishlistInfo(wishlistId: string) {
        return await this.wishlistRepository.findByPk(wishlistId);
    }


    async updateWishlistInfo(userId: string, wishlistId: string, wishlistInfo: ChangeWishlistInfoDTO) {
        const wishlist = await this.wishlistRepository.findByPk(wishlistId);

        this.checkIfUserHasRights(userId, wishlist);

        this.checkWishlistTypesAndAccess(wishlist, wishlistInfo);

        wishlist.set(wishlistInfo);
        wishlist.save();
    }

    private checkWishlistTypesAndAccess(wishlist: Wishlist, wishlistInfoToChange: ChangeWishlistInfoDTO) {
        const wishlistType = wishlistInfoToChange.wishlistType ?? wishlist.wishlistType;
        const wishlistAccess = wishlistInfoToChange.wishlistAccess ?? wishlist.wishlistAccess;

        if (wishlistType === WishlistType.Antiwishlist && wishlistAccess !== WishlistAccessType.ForFriends) {
            throw new BadRequestException('Антивишлист может быть доступен только для друзей.');
        }

        if (wishlistType === WishlistType.Planner && wishlistAccess !== WishlistAccessType.Private) {
            throw new BadRequestException('Планнер может быть доступен только для самого пользователя.');
        }
    }

    async deleteWishlist(userId: string, wishlistId: string) {
        const wishlist = await this.wishlistRepository.findByPk(wishlistId);

        this.checkIfUserHasRights(userId, wishlist);

        await wishlist.destroy();
    }

    private checkIfUserHasRights(userId: string, wishlist: Wishlist) {
        if (wishlist.creatorId !== userId) {
            throw new ForbiddenException('Вишлист может удалить только создатель вишлиста.');
        }
    }


    // Getting list of wishlists.

    async getWishlists(userRecieverId?: string, ownerId?: string) {
        const options = await this.getOptionsForSearchBasedOnIds(userRecieverId, ownerId);
        return await this.wishlistRepository.findAll(options);
    }

    private async getOptionsForSearchBasedOnIds(recieverId?: string, ownerId?: string) {
        if (ownerId && recieverId) {
            // Gettings self wishlists.
            if (ownerId === recieverId) {
                const coauthorWishlists = (await this.coauthoringService.getCoauthorWishlists(ownerId)).map(wishlist => wishlist.id);

                return {
                    where:
                    {
                        [Op.or]: [
                            { creatorId: ownerId },
                            { id: coauthorWishlists }
                        ]
                    }
                }
            }

            // Gettings friend's wishlist.
            if (this.friendshipService.checkIfFriends(recieverId, ownerId)) {
                const wishlistsWithReceiverAccess = await this.wishlistAccessService.getAvailableWishlists(recieverId);

                return {
                    where: {
                        creatorId: ownerId,
                        [Op.or]: [
                            {
                                wishlistAccess: {
                                    [Op.or]: [
                                        WishlistAccessType.ForFriends,
                                        WishlistAccessType.Public
                                    ]
                                }
                            },
                            {
                                id: wishlistsWithReceiverAccess
                            }
                        ]
                    }
                }
            }
        }

        // Gettings other user's wishlists.
        if (ownerId) {
            return { where: { wishlistAccess: WishlistAccessType.Public, creatorId: ownerId } }
        }

        // Getting all wishlists.
        return { where: { wishlistAccess: WishlistAccessType.Public } }
    }

    async getPublicWishlistsBySearch(input: string) {
        if (input === '') {
            return await this.wishlistRepository.findAll({
                where: { wishlistAccess: WishlistAccessType.Public }
            })
        }

        return await this.wishlistRepository.findAll({
            where: {
                title: { [Op.like]: `%${input}%` },
                wishlistAccess: WishlistAccessType.Public
            }
        });
    }


    // On user registration sustem should create example wishlists.
    async createWishlistsForUser(userId: string) {
        await this.wishlistRepository.create({
            id: uuidv4(),
            creatorId: userId,
            title: 'Вишлист для друзей',
            wishlistType: WishlistType.Default,
            wishlistAccess: WishlistAccessType.ForFriends
        });

        await this.wishlistRepository.create({
            id: uuidv4(),
            creatorId: userId,
            title: 'Антивишлист',
            wishlistType: WishlistType.Antiwishlist,
            wishlistAccess: WishlistAccessType.ForFriends
        });

        await this.wishlistRepository.create({
            id: uuidv4(),
            creatorId: userId,
            title: 'Планнер',
            wishlistType: WishlistType.Planner,
            wishlistAccess: WishlistAccessType.Private
        });

        await this.wishlistRepository.create({
            id: uuidv4(),
            creatorId: userId,
            title: 'Публичная подборка',
            wishlistType: WishlistType.Default,
            wishlistAccess: WishlistAccessType.Public
        });
    }


    // Gift creation.
    async addGift(userId: string, wishlistId: string) {
        const wishlist = await this.wishlistRepository.findByPk(wishlistId);

        if (userId !== wishlist.creatorId) {
            if (this.coauthoringService.isCoauthor(userId, wishlistId)) {
                throw new ForbiddenException('Пользователь не может добавлять подарки в этот вишлист.');
            }
        }

        return await this.giftService.createGift(userId, wishlistId);
    }

    async getWishlistGifts(wishlistId: string) {
        return await this.giftService.getWishlistGifts(wishlistId);
    }
}