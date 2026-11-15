import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { handleDbError } from '../common/db-error';

const UPDATABLE = [
  'match_id',
  'set_number',
  'player_one_score',
  'player_two_score',
];

@Injectable()
export class MatchScoresService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM match_scores ORDER BY score_id DESC',
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM match_scores WHERE score_id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Score #${id} not found`);
    }
    return rows[0];
  }

  async createScore(body: any) {
    const { match_id, set_number, player_one_score, player_two_score } = body;

    if (
      match_id == null ||
      set_number == null ||
      player_one_score == null ||
      player_two_score == null
    ) {
      throw new BadRequestException(
        'Please provide match_id, set_number, player_one_score, and player_two_score',
      );
    }

    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        `INSERT INTO match_scores
         (match_id, set_number, player_one_score, player_two_score)
         VALUES (?, ?, ?, ?)`,
        [match_id, set_number, player_one_score, player_two_score],
      );
      return this.findById(result.insertId);
    } catch (err) {
      handleDbError(err);
    }
  }

  async updateScore(id: number, body: any) {
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
        `UPDATE match_scores SET ${fields.join(', ')} WHERE score_id = ?`,
        values,
      );
    } catch (err) {
      handleDbError(err);
    }

    return this.findById(id);
  }

  async deleteScore(id: number) {
    await this.findById(id);
    try {
      await this.pool().execute<ResultSetHeader>(
        'DELETE FROM match_scores WHERE score_id = ?',
        [id],
      );
      return { message: 'Deleted' };
    } catch (err) {
      handleDbError(err);
    }
  }
}