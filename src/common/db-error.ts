import {
  BadRequestException,
  ConflictException,
  HttpException,
} from '@nestjs/common';

// Ginagawang malinaw na error ang mga karaniwang MySQL error
export function handleDbError(err: any): never {
  if (err instanceof HttpException) throw err;

  switch (err?.code) {
    case 'ER_NO_REFERENCED_ROW_2':
      throw new BadRequestException(
        'Referenced record does not exist. Check the ID you entered (e.g. venue, player, tournament, match, or user).',
      );
    case 'ER_ROW_IS_REFERENCED_2':
      throw new ConflictException(
        'This record is still used by other records, so it cannot be deleted.',
      );
    case 'ER_DUP_ENTRY':
      throw new ConflictException(
        'Duplicate entry. This record (or combination) already exists.',
      );
    default:
      throw err;
  }
}