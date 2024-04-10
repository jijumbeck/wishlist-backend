import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDTO {
    @ApiProperty({ example: 'example@email.com', description: 'Email пользователя' })
    readonly email: string;

    @ApiProperty({ example: 'login', description: 'Уникальный логин пользователя' })
    readonly login: string;
}

export class ChangeUserInfoDTO {
    @ApiProperty({ example: 'example@mail.com', description: 'Email пользователя' })
    readonly email?: string;

    @ApiProperty({ example: 'login', description: 'Уникальный логин пользователя' })
    readonly login?: string;

    @ApiProperty({ example: 'name', description: 'Имя пользователя' })
    readonly name?: string;

    @ApiProperty({ example: 'lastName', description: 'Фамилия пользователя' })
    readonly lastName?: string;

    @ApiProperty({ example: '2024-03-06T11:14:02.683Z', description: 'Дата рождения пользователя' })
    readonly birthdate?: Date;
}

export class GetUserDTO {
    @ApiProperty({ example: '11111111-1111-1111-111111111111', description: 'Уникальный идентификатор пользователя' })
    readonly id: string;
}

export class GetUserByEmailDTO {
    @ApiProperty({ example: 'example@mail.com', description: 'Email пользователя' })
    readonly email: string;
}

export class GetUserByLoginDTO {
    @ApiProperty({ example: 'login', description: 'Уникальный логин пользователя' })
    readonly login: string;
}

export class GetUsersBySearchDTO {
    @ApiProperty({
        example: 'input',
        description: 'Строка, по которой будет производится поиск пользователей. Поиск производится по логину, email, имени и фамилии.'
    })
    readonly input: string
}

export class UserInfo {
    readonly id: string;
    readonly login: string;
    readonly name?: string;
    readonly lastName?: string;
    readonly birthdate?: Date;
    readonly email: string;
}