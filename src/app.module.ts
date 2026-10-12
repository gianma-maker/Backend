import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlayersModule } from './players/players.module';
import { VenueModule } from './venue/venue.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { RegistrationModule } from './registration/registrations.module';
import { MatchScoresModule } from './match_score/match_scores.module';
import { MatchesModule } from './matches/matches.module';

import { AllDataController } from './all_data/all_data.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    PlayersModule,
    VenueModule,
    TournamentsModule,
    RegistrationModule,
    MatchScoresModule,
    MatchesModule,
  ],

  controllers: [
    AllDataController,
  ],
})
export class AppModule {}