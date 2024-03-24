import { ApiProperty } from "@nestjs/swagger";
import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";

export const enum FriendRequestStatus {
    None = "NONE",
    Subscriber = "SUBSCRIBER",
    Friend = "FRIEND"
}


@Table({ tableName: 'friendRequests' })
export class FriendRequest extends Model<InferAttributes<FriendRequest>, InferCreationAttributes<FriendRequest>> {

    @ApiProperty({ description: 'Id первого пользователя.' })
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING })
    userIdFirst: string;


    @ApiProperty({ description: 'Id второго пользователя.' })
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING })
    userIdSecond: string;

    @ApiProperty({ description: 'Статус запроса  в друзья.' })
    @Column({ type: DataType.ENUM(FriendRequestStatus.None, FriendRequestStatus.Subscriber, FriendRequestStatus.Friend) })
    status: string;
}