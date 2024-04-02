import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { WishlistAccess } from "./wishlist-access.model";


@Injectable()
export class WishlistAccessService {
    constructor(@InjectModel(WishlistAccess) private wishlistAccessRepository: typeof WishlistAccess) { }

    async shareAccess(userId: string, wishlistId: string) {
        const accessForUser = await this.wishlistAccessRepository.findOne({
            where: {
                userId: userId,
                wishlistId: wishlistId
            }
        });

        if (!accessForUser) {
            await this.wishlistAccessRepository.create({
                userId: userId,
                wishlistId: wishlistId
            })
        }
    }

    async forbidAccess(userId: string, wishlistId: string) {
        const accessForUser = await this.wishlistAccessRepository.findOne({
            where: {
                userId: userId,
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
}