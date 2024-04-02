import { ApiProperty } from "@nestjs/swagger";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Reservation } from "src/reservation/reservation.model";
import { User } from "src/user/user.model";
import { Wishlist } from "src/wishlist/wishlist.model";

@Table({ tableName: 'gifts' })
export class Gift extends Model<InferAttributes<Gift>, InferCreationAttributes<Gift>> {

    @ApiProperty({ example: '11111111-1111-1111-111111111111', description: 'Уникальный идентификатор подарка' })
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    declare id: string;

    @ApiProperty({ example: 'Подарок', description: 'Название подарка' })
    @Column({ type: DataType.STRING })
    declare title: string;

    @ApiProperty({ example: 'http://example.com/example', description: 'Ссылка на подарок.' })
    @Column({ type: DataType.STRING })
    declare URL: CreationOptional<string>;

    @ApiProperty({ example: 'http://example.com/example.png', description: 'Ссылка на картинку подарка.' })
    @Column({ type: DataType.STRING })
    declare imageURL: CreationOptional<string>;

    @ApiProperty({ example: 990, description: 'Цена подарка' })
    @Column({ type: DataType.INTEGER })
    declare price: CreationOptional<number>;

    @ApiProperty({ example: 'Красный выглядит круто.', description: 'Описание подарка' })
    @Column({ type: DataType.STRING })
    declare description: CreationOptional<string>;


    @ForeignKey(() => User)
    declare userId: string;

    @ForeignKey(() => Wishlist)
    declare wishlistId: string;

    
    @BelongsToMany(() => User, () => Reservation)
    declare reservations?: User[]
}