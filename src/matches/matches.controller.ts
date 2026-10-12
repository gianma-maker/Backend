
import {Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,} from '@nestjs/common';

import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get()
    getAll() {
    return this.matchesService.getAll();
}

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findById(id);
}

    @Post()
    create(@Body() body: any) {
    return this.matchesService.createMatch(body);
    }

    @Put(':id')
    update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
) {
    return this.matchesService.updateMatch(id, body);
}

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.deleteMatch(id);
    }
}   