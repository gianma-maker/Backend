import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { VenueService, VenueInput, CreateVenueInput } from './venue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('venues')
export class VenueController {
  constructor(private venueService: VenueService) {}

  @Get()
  getAll() {
    return this.venueService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.venueService.findById(id);
  }

  @Post()
  create(@Body() body: CreateVenueInput) {
    return this.venueService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: VenueInput) {
    return this.venueService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.venueService.remove(id);
  }
}