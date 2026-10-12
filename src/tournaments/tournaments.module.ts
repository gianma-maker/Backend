import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TournamentsService } from './tournaments.sevice';
import { TournamentsController } from './tournaments.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}