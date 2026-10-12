import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TournamentsService } from './tournaments.sevice';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tournaments')
export class TournamentsController {
  constructor(private tournamentsService: TournamentsService) {}

  @Get()
  async getAll() {
    return this.tournamentsService.getAll();
  }

  @Get(':tournament_id')
  async getOne(@Param('tournament_id') id: string) {
    return this.tournamentsService.findById(id);
  }

  @Post()
async create(
  @Body()
  body: {
    tournament_id: string;
    tournament_name: string;
    tournament_date: string;
    tournament_type: string;
  },
) {
  return this.tournamentsService.createUser(
    body.tournament_id,
    body.tournament_name,
    body.tournament_date,
    body.tournament_type,
  );
}

  @Put(':tournament_id')
  async update(@Param('tournament_id') tournament_id: string, @Body() body: any) {
    return this.tournamentsService.updateUser(tournament_id, body);
  }

  @Delete(':tournament_id')
  async remove(@Param('tournament_id') tournament_id: string) {
    return this.tournamentsService.deleteUser(tournament_id);
  }
}