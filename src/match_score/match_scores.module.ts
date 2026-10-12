import { Module } from '@nestjs/common';
import { MatchScoresController } from './match_scores.controller';
import { MatchScoresService } from './match_scores.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MatchScoresController],
  providers: [MatchScoresService],
  exports: [MatchScoresService],
})
export class MatchScoresModule {}