import { Module } from '@nestjs/common';
import { ProfileController } from 'src/controllers/profile.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  providers: [],
  controllers: [ProfileController],
})
export class ProfileModule {}
