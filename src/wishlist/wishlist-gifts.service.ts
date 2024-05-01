import { BadRequestException, ForbiddenException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { Wishlist } from "./wishlist.model";
import { InjectModel } from "@nestjs/sequelize";
import { CoauthoringService } from "src/coauthoring/coauthoring.service";
import { GiftService } from "src/gift/gift.service";


@Injectable()
export class WishlistGiftsService {
    constructor(
        @InjectModel(Wishlist) private wishlistRepository: typeof Wishlist,
        @Inject(forwardRef(() => CoauthoringService)) private coauthoringService: CoauthoringService,
        private giftService: GiftService,
    ) { }


    private async hasRights(userId: string, wishlist: Wishlist) {
        if (userId !== wishlist.creatorId) {
            if (!(await this.coauthoringService.isCoauthor(userId, wishlist.id))) {
                throw new ForbiddenException('Пользователь не может добавлять подарки в этот вишлист.');
            }
        }
    }


    // Gift creation.
    async addGift(userId: string, wishlistId: string, giftId?: string) {
        const wishlist = await this.wishlistRepository.findByPk(wishlistId);

        await this.hasRights(userId, wishlist);

        if (giftId) {
            const gift = await this.giftService.getGiftInfo(giftId);
            if (!gift) {
                throw new BadRequestException(`Подарок с id ${giftId} не найден.`);
            }

            return await this.giftService.addGift({
                userId,
                wishlistId,
                title: gift.title,
                URL: gift.URL,
                price: gift.price,
                description: gift.description
            })
        }

        return await this.giftService.createGift(userId, wishlistId);
    }


    async getWishlistGifts(wishlistId: string) {
        return await this.giftService.getWishlistGifts(wishlistId);
    }
}