import { ApiProperty } from "@nestjs/swagger";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Gift } from "src/gift/gift.model";
import { User } from "src/user/user.model";
import { WishlistAccess } from "./wishlist-access.model";
import { Coauthoring } from "src/coauthoring/coauthoring.model";

export const enum WishlistAccessType {
    Private = "PRIVATE",
    ForFriends = "FOR_FRIENDS",
    Public = "PUBLIC",
    Custom = "CUSTOM"
}

export const enum WishlistType {
    Default = "WISHLIST",
    Antiwishlist = "ANTIWISHLIST",
    Planner = "PLANNER"
}

@Table({ tableName: 'wishlists'})
export class Wishlist extends Model<InferAttributes<Wishlist>, InferCreationAttributes<Wishlist>> {

    @ApiProperty({ example: '11111111-1111-1111-111111111111', description: 'Уникальный идентификатор подарка' })
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    declare id: string;

    @ForeignKey(() => User)
    //@BelongsTo(() => User)
    declare creatorId: string;

    @ApiProperty({ example: 'Подарок', description: 'Название подарка' })
    @Column({ type: DataType.STRING })
    declare title: string;


    @Column({ type: DataType.ENUM(WishlistType.Default, WishlistType.Antiwishlist, WishlistType.Planner) })
    declare wishlistType: string;

    @Column({ type: DataType.ENUM(WishlistAccessType.Private, WishlistAccessType.ForFriends, WishlistAccessType.Public, WishlistAccessType.Custom) })
    declare wishlistAccess: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    declare hasAccessByLink: boolean;


    @HasMany(() => Gift)
    declare gifts?: Gift[];

    @BelongsToMany(() => User, () => WishlistAccess)
    declare usersWithAccess?: User[]

    @BelongsToMany(() => User, () => Coauthoring)
    declare coauthors?: User[]
}