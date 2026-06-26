import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesGuard } from './guards/roles.guard';
import { User } from './models/user.model';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    SequelizeModule.forFeature([User]),
  ],
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class CommonModule {}
