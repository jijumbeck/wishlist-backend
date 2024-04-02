import { ForeignKey, Model, Table } from "sequelize-typescript";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import { User } from "src/user/user.model";
import { Gift } from "src/gift/gift.model";


@Table({ tableName: 'reservation' })
export class Reservation extends Model<InferAttributes<Reservation>, InferCreationAttributes<Reservation>> {

    @ForeignKey(() => User)
    declare userId: string;

    @ForeignKey(() => Gift)
    declare giftId: string;
}