import { CreationOptional, Deferrable, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";

@Table({ tableName: 'auth' })
export class Auth extends Model<InferAttributes<Auth>, InferCreationAttributes<Auth>> {

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, unique: true, })
    declare userId: string;

    @Column({ type: DataType.STRING, })
    declare passwordHash: string;
}