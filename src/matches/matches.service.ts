import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { handleDbError } from '../common/db-error';

const COLUMNS = `match_id, tournament_id, player_one_id, player_two_id,
  DATE_FORMAT(match_date, '%Y-%m-%d') AS match_date,
  TIME_FORMAT(match_time, '%H:%i:%s') AS match_time,
  round_name, match_status, winner_id`;

const UPDATABLE = [
  'tournament_id',
  'player_one_id',
  'player_two_id',
  'match_date',
  'match_time',
  'round_name',
  'match_status',
  'winner_id',
];

@Injectable()
export class MatchesService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM matches ORDER BY match_id DESC`,
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM matches WHERE match_id = ?`,
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Match #${id} not found`);
    }
    return rows[0];
  }

  async createMatch(body: any) {
    const {
      tournament_id,
      player_one_id,
      player_two_id,
      match_date,
      match_time,
      round_name,
      match_status,
      winner_id,
    } = body;

    if (
      tournament_id == null ||
      player_one_id == null ||
      player_two_id == null ||
      !match_date ||
      !match_time ||
      !round_name
    ) {
      throw new BadRequestException(
        'Please provide tournament_id, player_one_id, player_two_id, match_date, match_time, and round_name',
      );
    }

    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        `INSERT INTO matches
         (tournament_id, player_one_id, player_two_id,
          match_date, match_time, round_name, match_status, winner_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tournament_id,
          player_one_id,
          player_two_id,
          match_date,
          match_time,
          round_name,
          match_status ?? 'Scheduled',
          winner_id ?? null,
        ],
      );
      return this.findById(result.insertId);
    } catch (err) {
      handleDbError(err);
    }
  }

  async updateMatch(id: number, body: any) {
    await this.findById(id);

    const fields: string[] = [];
    const values: any[] = [];

    for (const field of UPDATABLE) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (fields.length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }

    try {
      values.push(id);
      await this.pool().execute(
        `UPDATE matches SET ${fields.join(', ')} WHERE match_id = ?`,
        values,
      );
    } catch (err) {
      handleDbError(err);
    }

    return this.findById(id);
  }

  async deleteMatch(id: number) {
    await this.findById(id);
    try {
      await this.pool().execute<ResultSetHeader>(
        'DELETE FROM matches WHERE match_id = ?',
        [id],
      );
      return { message: 'Deleted' };
    } catch (err) {
      handleDbError(err);
    }
  }
}