import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    RegistrationModule, 
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationModule {}