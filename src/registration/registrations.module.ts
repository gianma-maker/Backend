import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationModule {}