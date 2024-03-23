import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.model';
import { AuthModule } from 'src/auth/auth.module';
import { Auth } from 'src/auth/auth.model';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User, Auth]),
    forwardRef(() => AuthModule)
  ],
  exports: [
    UserService
  ]
})
export class UserModule { }
