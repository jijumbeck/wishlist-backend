import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";
import { Wishlist } from "src/wishlist/wishlist.model";


export const enum CoauthoringStatus {
    None = 'NONE',
    Sent = "SENT",
    Accepted = "ACCEPTED"
}


@Table({ tableName: 'coauthoring' })
export class Coauthoring extends Model<InferAttributes<Coauthoring>, InferCreationAttributes<Coauthoring>> {

    @ForeignKey(() => User)
    declare userId: string;

    @ForeignKey(() => Wishlist)
    declare wishlistId: string;

    @Column({ type: DataType.ENUM(CoauthoringStatus.None, CoauthoringStatus.Sent, CoauthoringStatus.Accepted) })
    declare status: string;
}