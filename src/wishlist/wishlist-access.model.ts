import { InferAttributes, InferCreationAttributes } from "sequelize";
import { ForeignKey, Model, Table } from "sequelize-typescript";
import { Wishlist } from "./wishlist.model";
import { User } from "src/user/user.model";

@Table({ tableName: 'wishlistAccess' })
export class WishlistAccess extends Model<InferAttributes<WishlistAccess>, InferCreationAttributes<WishlistAccess>> {
    @ForeignKey(() => Wishlist)
    declare wishlistId: string;

    @ForeignKey(() => User)
    declare userId: string;
}