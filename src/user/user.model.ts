import { ApiProperty } from "@nestjs/swagger";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { Auth } from "src/auth/auth.model";
import { FriendRequest } from "src/friendship/friends.model";


@Table({ tableName: 'users' })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {

    @ApiProperty({ example: '11111111-1111-1111-111111111111', description: 'Уникальный идентификатор пользователя' })
    @Column({ type: DataType.STRING, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 'login', description: 'Уникальный логин пользователя' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    login: string;

    @ApiProperty({ example: 'name', description: 'Имя пользователя' })
    @Column({ type: DataType.STRING, })
    name: CreationOptional<string>;

    @ApiProperty({ example: 'lastName', description: 'Фамилия пользователя' })
    @Column({ type: DataType.STRING, })
    lastName: CreationOptional<string>;

    @ApiProperty({ example: '2024-03-06T11:14:02.683Z', description: 'Дата рождения пользователя' })
    @Column({ type: DataType.DATE, })
    birthdate: CreationOptional<Date>;

    @ApiProperty({ example: 'example@mail.com', description: 'Email пользователя' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    email: string;

    @HasOne(() => Auth)
    authCredentials: Auth;

    @HasMany(() => FriendRequest)
    requests?: FriendRequest[]
}