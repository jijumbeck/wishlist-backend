import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Gift } from "./gift.model";
import { ChangeGiftInfoDTO } from "./gift.dto";
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class GiftService {
    constructor(@InjectModel(Gift) private giftRepository: typeof Gift) { }

    async createGift(userId: string, wishlistId: string) {
        const gift = await this.giftRepository.create(
            {
                title: 'Новый подарок',
                wishlistId: wishlistId,
                userId: userId,
                id: uuidv4()
            }
        );
        return gift;
    }


    async deleteGift(userId: string, giftId: string) {
        const gift = await this.giftRepository.findByPk(giftId);

        this.checkIfUserHasRight(userId, gift);

        await gift.destroy();

        return 'Подарок удален.';
    }

    async changeGiftInfo(userId: string, giftId: string, giftInfo: ChangeGiftInfoDTO) {
        const gift = await this.giftRepository.findByPk(giftId);

        this.checkIfUserHasRight(userId, gift);

        gift.set(giftInfo);
        await gift.save();
        return 'Данные подарка изменены.';
    }

    async getGiftInfo(giftId: string) {
        const gift = await this.giftRepository.findByPk(giftId);

        if (!gift) {
            throw new NotFoundException(`Подарка с id ${giftId} нет.`);
        }

        return gift;
    }

    private checkIfUserHasRight(userId: string, gift: Gift) {
        if (gift.userId !== userId) {
            throw new ForbiddenException('Подарок не может быть удален этим пользователем.');
        }
    }

    async getWishlistGifts(wishlistId: string) {
        return await this.giftRepository.findAll({
            where: { wishlistId: wishlistId }
        })
    }
}