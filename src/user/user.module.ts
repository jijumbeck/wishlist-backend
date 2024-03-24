import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.model';
import { AuthModule } from 'src/auth/auth.module';
import { Auth } from 'src/auth/auth.model';
import { FriendRequest } from 'src/friendship/friends.model';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User, Auth, FriendRequest]),
    forwardRef(() => AuthModule)
  ],
  exports: [
    UserService
  ]
})
export class UserModule { }
