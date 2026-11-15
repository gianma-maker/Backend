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
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  RegistrationsService,
} from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}

  @Get()
  getAll() {
    return this.registrationsService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.findById(id);
  }

  @Post()
  create(@Body() body: CreateRegistrationDto) {
    return this.registrationsService.createRegistration(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRegistrationDto,
  ) {
    return this.registrationsService.updateRegistration(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.deleteRegistration(id);
  }
}