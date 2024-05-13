import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Gift } from "src/gift/gift.model";

@Table({ tableName: 'guestReservation' })
export class GuestReservation extends Model<InferAttributes<GuestReservation>, InferCreationAttributes<GuestReservation>> {

    @Column({ type: DataType.STRING })
    declare guestId: string;

    @Column({ type: DataType.STRING })
    declare guestName: string;

    @Column({ type: DataType.STRING })
    @ForeignKey(() => Gift)
    declare giftId: string;
}