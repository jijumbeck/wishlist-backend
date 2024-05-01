import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { v4 as uuidv4 } from 'uuid';

import { Wishlist, WishlistAccessType, WishlistType } from "./wishlist.model";
import { ChangeWishlistInfoDTO } from "./wishlist.dto";


@Injectable()
export class WishlistService {
    constructor(@InjectModel(Wishlist) private wishlistRepository: typeof Wishlist) { }
    

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
}