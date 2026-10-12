import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VenueController],
  providers: [VenueService],
  exports: [VenueService],
})
export class VenueModule {}