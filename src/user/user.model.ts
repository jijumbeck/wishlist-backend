import { ApiProperty } from "@nestjs/swagger";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { Auth } from "src/auth/auth.model";
import { Coauthoring } from "src/coauthoring/coauthoring.model";
import { FriendRequest } from "src/friendship/friends.model";
import { Gift } from "src/gift/gift.model";
import { Reservation } from "src/reservation/reservation.model";
import { Wishlist } from "src/wishlist/wishlist.model";


@Table({ tableName: 'users' })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {

    @ApiProperty({ example: '11111111-1111-1111-111111111111', description: 'Уникальный идентификатор пользователя' })
    @Column({ type: DataType.STRING, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    declare id: string;

    @ApiProperty({ example: 'login', description: 'Уникальный логин пользователя' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    declare login: string;

    @ApiProperty({ example: 'name', description: 'Имя пользователя' })
    @Column({ type: DataType.STRING, })
    declare name: CreationOptional<string>;

    @ApiProperty({ example: 'lastName', description: 'Фамилия пользователя' })
    @Column({ type: DataType.STRING, })
    declare lastName: CreationOptional<string>;

    @ApiProperty({ example: '2024-03-06T11:14:02.683Z', description: 'Дата рождения пользователя' })
    @Column({ type: DataType.DATE, })
    declare birthdate: CreationOptional<Date>;

    @ApiProperty({ example: 'example@mail.com', description: 'Email пользователя' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    declare email: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    declare isEmailConfirmed: boolean;

    @Column({ type: DataType.STRING })
    declare imageURL: CreationOptional<string>;


    @HasOne(() => Auth)
    declare authCredentials: Auth;


    @HasMany(() => FriendRequest)
    declare requests?: FriendRequest[]


    @HasMany(() => Wishlist)
    declare wishlists?: Wishlist[]

    @HasMany(() => Gift)
    declare gifts?: Gift[]

    @BelongsToMany(() => Gift, () => Reservation)
    declare reservedGifts?: Gift[]


    @BelongsToMany(() => Wishlist, () => Coauthoring)
    declare coauthorWishlists?: Wishlist[]
}