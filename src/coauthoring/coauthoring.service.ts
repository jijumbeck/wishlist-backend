import { BadRequestException, ForbiddenException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Coauthoring, CoauthoringStatus } from "./coauthoring.model";
import { WishlistService } from "src/wishlist/wishlist.service";
import { UserService } from "src/user/user.service";


@Injectable()
export class CoauthoringService {
    constructor(@InjectModel(Coauthoring) private coauthoringRepository: typeof Coauthoring,
        @Inject(forwardRef(() => WishlistService)) private wishlistService: WishlistService,
        @Inject(forwardRef(() => UserService)) private userService: UserService
    ) { }

    async isCoauthor(userId: string, wishlistId: string) {
        const coauthoring = await this.coauthoringRepository.findOne({
            where: {
                userId: userId,
                wishlistId: wishlistId
            }
        })

        if (!coauthoring) {
            return false;
        }

        return coauthoring.status === CoauthoringStatus.Accepted;
    }

    async getCoauthorWishlists(userId: string) {
        return await this.coauthoringRepository.findAll({
            where: {
                userId: userId,
                status: CoauthoringStatus.Accepted
            }
        })
    }

    async addCoauthor(userId: string, coauthorId: string, wishlistId: string) {
        const wishlist = await this.wishlistService.getWishlistInfo(userId, wishlistId);

        const coauthoring = await this.coauthoringRepository.findOne({
            where: {
                userId: coauthorId,
                wishlistId: wishlistId
            }
        });

        if (userId !== wishlist.creatorId) {
            if (coauthoring && coauthoring.userId !== userId) {
                throw new ForbiddenException(`Пользователю ${userId} не был отправлен запрос на соавторство этого вишлиста.`)
            }
        }

        if (coauthoring && coauthoring.userId === userId) {
            coauthoring.status = CoauthoringStatus.Accepted;
            coauthoring.save();
            return;
        }

        if (!coauthoring) {
            await this.coauthoringRepository.create({
                userId: coauthorId,
                wishlistId: wishlistId,
                status: CoauthoringStatus.Sent
            });
        }
    }

    async removeCoauthor(userId: string, coauthorId: string, wishlistId: string) {
        const wishlist = await this.wishlistService.getWishlistInfo(userId, wishlistId);

        const coauthoring = await this.coauthoringRepository.findOne({
            where: {
                userId: coauthorId,
                wishlistId: wishlistId
            }
        });

        if (!coauthoring) {
            throw new BadRequestException(`Записи соавторства ${userId} пользователя в вишлисте ${wishlistId} не существует.`);
        }

        if (userId !== wishlist.creatorId) {
            if (coauthoring && coauthoring.userId !== userId) {
                throw new ForbiddenException(`Пользователю ${userId} не был отправлен запрос на соавторство этого вишлиста.`)
            }
        }

        await coauthoring.destroy();
    }

    async getCoauthors(wishlistId: string) {
        const coauthorsId = (await this.coauthoringRepository.findAll({
            where: {
                wishlistId: wishlistId,
                status: CoauthoringStatus.Accepted
            }
        })).map(coauthoringRequest => coauthoringRequest.userId);

        const coauthors = Promise.all(coauthorsId.map(coauthorId => this.userService.getUser({ id: coauthorId })));
        return coauthors;
    }
}