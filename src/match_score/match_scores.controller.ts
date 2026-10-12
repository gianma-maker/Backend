
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { MatchScoresService } from './match_scores.service';

@Controller('match-scores')
export class MatchScoresController {
  constructor(
    private readonly matchScoresService: MatchScoresService,
  ) {}

  @Get()
  getAll() {
    return this.matchScoresService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchScoresService.findById(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.matchScoresService.createScore(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.matchScoresService.updateScore(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchScoresService.deleteScore(id);
  }
}