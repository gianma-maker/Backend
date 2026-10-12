import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}