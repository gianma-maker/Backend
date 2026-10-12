import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VenueService } from './venue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('venue')
export class VenueController {
  constructor(private venueService: VenueService) {}

  @Get()
  async getAll() {
    return this.venueService.getAll();
  }

  @Get(':venue_id')
  async getOne(@Param('venue_id') venue_id: string) {
    return this.venueService.findByaddress(venue_id);
  }

  // Create user (open - for demo)
  @Post()
async create(@Body() body: { venue_address: string; location: string; capacity: number }) {
  return this.venueService.createUser(
    body.venue_address,
    body.location,
    body.capacity,
  );
}

  @Put(':venue_id')
  async update(@Param('venue_id') venue_id: string, @Body() body: any) {
    return this.venueService.updateUser(venue_id, body);
  }

@Delete(':venue_id')
async remove(@Param('venue_id') venue_id: string) {
  return this.venueService.deleteUser(venue_id);
}
}