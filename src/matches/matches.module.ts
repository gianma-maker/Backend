import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}