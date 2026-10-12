import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CreateRegistrationDto, UpdateRegistrationDto, RegistrationsService } from './registrations.service';

@Controller('registrations')
export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}


  @Get()
  async getAll() {
    return this.registrationsService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.registrationsService.findById(+id);
  }

  @Post()
  async create(@Body() body: CreateRegistrationDto) {
    return this.registrationsService.createRegistration(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRegistrationDto) {
    return this.registrationsService.updateRegistration(+id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.registrationsService.deleteRegistration(+id);
  }
}