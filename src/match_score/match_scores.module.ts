import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MatchScoresController } from './match_scores.controller';
import { MatchScoresService } from './match_scores.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [MatchScoresController],
  providers: [MatchScoresService],
  exports: [MatchScoresService],
})
export class MatchScoresModule {}