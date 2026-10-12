import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('players')
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @Get()
  getAll() {
    return this.playersService.getAll();
  }

  @Get(':player_id')
  getOne(@Param('player_id') player_id: string) {
    return this.playersService.findById(player_id);
  }

  @Post()
  create(@Body() body: any) {
    return this.playersService.createUser(
      body.player_id,
      body.first_name,
      body.last_name,
      body.gender,
      body.birth_date,
      body.contact_number,
      body.ranking_points,
    );
  }

  @Put(':player_id')
  update(@Param('player_id') player_id: string, @Body() body: any) {
    return this.playersService.updateUser(player_id, body);
  }

  @Delete(':player_id')
  remove(@Param('player_id') player_id: string) {
    return this.playersService.deleteUser(player_id);
  }
}