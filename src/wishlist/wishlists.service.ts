import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import { Wishlist, WishlistAccessType, WishlistType } from "./wishlist.model";
import { CoauthoringService } from "src/coauthoring/coauthoring.service";
import { FriendshipService } from "src/friendship/friends.service";
import { WishlistAccessService } from "./wishlist-access.service";


@Injectable()
export class WishlistsService {
    constructor(@InjectModel(Wishlist) private wishlistRepository: typeof Wishlist,
        @Inject(forwardRef(() => CoauthoringService)) private coauthoringService: CoauthoringService,
        private friendshipService: FriendshipService,
        private wishlistAccessService: WishlistAccessService
    ) { }


    // Getting wishlists of ownerId that are accessible for userRecieverId, or wishlists.
    async getWishlists(userRecieverId?: string, ownerId?: string) {
        const options = await this.getOptionsForSearchBasedOnIds(userRecieverId, ownerId);
        return await this.wishlistRepository.findAll(options);
    }

    private async getOptionsForSearchBasedOnIds(recieverId?: string, ownerId?: string) {
        if (ownerId && recieverId) {
            // Gettings self wishlists.
            if (ownerId === recieverId) {
                const coauthorWishlists = (await this.coauthoringService.getCoauthorWishlists(ownerId)).map(coauthoring => coauthoring.wishlistId);

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


    // Get public wishlists based on search
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


    // On user registration system should create example wishlists.
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
}