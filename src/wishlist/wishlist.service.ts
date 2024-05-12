import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { v4 as uuidv4 } from 'uuid';

import { Wishlist, WishlistAccessType, WishlistType } from "./wishlist.model";
import { ChangeWishlistInfoDTO } from "./wishlist.dto";
import { FriendshipService } from "src/friendship/friends.service";
import { WishlistAccessService } from "./wishlist-access.service";
import { CoauthoringService } from "src/coauthoring/coauthoring.service";


@Injectable()
export class WishlistService {
    constructor(@InjectModel(Wishlist) private wishlistRepository: typeof Wishlist,
        private friendService: FriendshipService,
        @Inject(forwardRef(() => CoauthoringService)) private coauthoringService: CoauthoringService,
        @Inject(forwardRef(() => WishlistAccessService)) private wishlistAccessService: WishlistAccessService
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


    async getWishlistInfo(userId: string, wishlistId: string) {
        const wishlist = await this.wishlistRepository.findByPk(wishlistId);

        if (!wishlist) {
            throw new NotFoundException('Вишлист не найден.');
        }

        this.hasRightsToGetWishlist(wishlist, userId);

        return wishlist;
    }

    async hasRightsToGetWishlist(wishlist: Wishlist, userId: string) {
        if (wishlist.wishlistAccess === WishlistAccessType.Public) {
            return true;

        }

        const coauthors = await this.coauthoringService.getCoauthors(wishlist.id);

        if (wishlist.creatorId === userId || coauthors.findIndex(value => value.id === userId) >= 0) {
            return true;
        }

        else if (wishlist.wishlistAccess === WishlistAccessType.ForFriends) {
            const friends = await this.friendService.getFriends(wishlist.creatorId);
            const index = friends.findIndex(friend => friend.id === userId);
            if (index >= 0) {
                return true;
            }

        } else if (wishlist.wishlistAccess === WishlistAccessType.Custom) {
            const accessableWishlists = await this.wishlistAccessService.getAvailableWishlists(userId);
            const index = accessableWishlists.findIndex(value => value === wishlist.id);
            if (index >= 0) {
                return true;
            }
        }

        throw new ForbiddenException('Вишлист недоступен.');
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
}