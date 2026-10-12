import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('all_data')
export class AllDataController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getAllData() {
    const pool = this.db.getPool();

    const [users] = await pool.query('SELECT * FROM users');
    const [venue] = await pool.query('SELECT * FROM venue');
    const [tournaments] = await pool.query('SELECT * FROM tournaments');
    const [players] = await pool.query('SELECT * FROM players');
    const [registrations] = await pool.query('SELECT * FROM registrations');
    const [matches] = await pool.query('SELECT * FROM matches');
    const [match_scores] = await pool.query('SELECT * FROM match_scores');

    return {
      users,
      venue,
      tournaments,
      players,
      registrations,
      matches,
      match_scores,
    };
  }
}