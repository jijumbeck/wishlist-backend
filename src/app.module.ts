import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './user/user.module';
import { User } from './user/user.model';

import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/auth.model';

import { FriendshipModule } from './friendship/friends.module';
import { FriendRequest } from './friendship/friends.model';

import { GiftModule } from './gift/gift.module';
import { Gift } from './gift/gift.model';

import { Wishlist } from './wishlist/wishlist.model';
import { WishlistModule } from './wishlist/wishlist.module';
import { WishlistAccess } from './wishlist/wishlist-access.model';

import { Reservation } from './reservation/reservation.model';
import { GuestReservation } from './reservation/guestReservation.model';
import { CoauthoringModule } from './coauthoring/coauthoring.module';
import { Coauthoring } from './coauthoring/coauthoring.model';
import { ReservationModule } from './reservation/reservation.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'path';
import { NotificationModule } from './notification/notification.module';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Auth, FriendRequest, Gift, Wishlist, WishlistAccess, Coauthoring, Reservation, GuestReservation],
      autoLoadModels: true,
      synchronize: true,
      retryAttempts: 3
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
      exclude: ['/api/(.*)']
    }),
    UserModule,
    AuthModule,
    FriendshipModule,
    GiftModule,
    WishlistModule,
    CoauthoringModule,
    ReservationModule,
    FileModule,
    NotificationModule,
    EmailModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
