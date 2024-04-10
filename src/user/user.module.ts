import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.model';
import { AuthModule } from 'src/auth/auth.module';
import { WishlistModule } from 'src/wishlist/wishlist.module';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => WishlistModule),
    FileModule
  ],
  exports: [
    UserService
  ]
})
export class UserModule { }
