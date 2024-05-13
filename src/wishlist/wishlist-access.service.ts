import { ForbiddenException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { WishlistAccess } from "./wishlist-access.model";
import { WishlistService } from "./wishlist.service";


@Injectable()
export class WishlistAccessService {
    constructor(@InjectModel(WishlistAccess) private wishlistAccessRepository: typeof WishlistAccess,
        @Inject(forwardRef(() => WishlistService)) private wislistService: WishlistService
    ) { }

    async shareAccess(userId: string, userWithAccess: string, wishlistId: string) {
        const wishlist = await this.wislistService.getWishlistInfo(userId, wishlistId);

        if (wishlist.creatorId !== userId) {
            throw new ForbiddenException('Пользователь не является создателем вишлиста.');
        }

        const accessForUser = await this.wishlistAccessRepository.findOne({
            where: {
                userId: userWithAccess,
                wishlistId: wishlistId
            }
        });

        if (!accessForUser) {
            await this.wishlistAccessRepository.create({
                userId: userWithAccess,
                wishlistId: wishlistId
            })
        }
    }

    async forbidAccess(userId: string, userWithAccess: string, wishlistId: string) {
        const wishlist = await this.wislistService.getWishlistInfo(userId, wishlistId);

        if (wishlist.creatorId !== userId) {
            throw new ForbiddenException('Пользователь не является создателем вишлиста.');
        }

        const accessForUser = await this.wishlistAccessRepository.findOne({
            where: {
                userId: userWithAccess,
                wishlistId: wishlistId
            }
        });

        if (accessForUser) {
            await accessForUser.destroy();
        }
    }

    async getAvailableWishlists(userId: string) {
        const wishlistAccesses = await this.wishlistAccessRepository.findAll({
            where: {
                userId: userId
            }
        });

        return wishlistAccesses.map(value => value.wishlistId);
    }

    async getUsers(wishlistId: string) {
        const wishlistAccess = await this.wishlistAccessRepository.findAll({
            where: {
                wishlistId: wishlistId
            }
        })

        const users = wishlistAccess.map(wishlistAccess => wishlistAccess.userId);

        return users;
    }
}