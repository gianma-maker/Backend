import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { handleDbError } from '../common/db-error';

// Ilan ang kailangang manalunang game para manalo sa match
// Best of 5 = 3, Best of 7 = 4, Best of 3 = 2
const GAMES_TO_WIN = 3;

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

  /** Kinukwenta ang nanalo base sa lahat ng game scores ng isang match */
  private async recalcMatch(matchId: number) {
    const [matchRows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT player_one_id, player_two_id, match_status FROM matches WHERE match_id = ?',
      [matchId],
    );
    if (matchRows.length === 0) return;
    const match = matchRows[0];
    if (match.match_status === 'Cancelled') return;

    const [scores] = await this.pool().execute<RowDataPacket[]>(
      'SELECT player_one_score, player_two_score FROM match_scores WHERE match_id = ?',
      [matchId],
    );

    let p1 = 0;
    let p2 = 0;
    for (const s of scores) {
      if (s.player_one_score > s.player_two_score) p1++;
      else if (s.player_two_score > s.player_one_score) p2++;
    }

    let winner: number | null = null;
    if (p1 >= GAMES_TO_WIN) winner = match.player_one_id;
    else if (p2 >= GAMES_TO_WIN) winner = match.player_two_id;

    const status =
      winner !== null ? 'Completed' : scores.length > 0 ? 'Ongoing' : 'Scheduled';

    await this.pool().execute(
      'UPDATE matches SET winner_id = ?, match_status = ? WHERE match_id = ?',
      [winner, status, matchId],
    );
  }

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
    if (Number(player_one_score) === Number(player_two_score)) {
      throw new BadRequestException('A game cannot end in a tie.');
    }

    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        `INSERT INTO match_scores
         (match_id, set_number, player_one_score, player_two_score)
         VALUES (?, ?, ?, ?)`,
        [match_id, set_number, player_one_score, player_two_score],
      );
      await this.recalcMatch(Number(match_id));
      return this.findById(result.insertId);
    } catch (err) {
      handleDbError(err);
    }
  }

  async updateScore(id: number, body: any) {
    const before = await this.findById(id);

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

    const after = await this.findById(id);
    await this.recalcMatch(Number(after.match_id));
    if (before.match_id !== after.match_id) {
      await this.recalcMatch(Number(before.match_id));
    }
    return after;
  }

  async deleteScore(id: number) {
    const before = await this.findById(id);
    try {
      await this.pool().execute<ResultSetHeader>(
        'DELETE FROM match_scores WHERE score_id = ?',
        [id],
      );
    } catch (err) {
      handleDbError(err);
    }
    await this.recalcMatch(Number(before.match_id));
    return { message: 'Deleted' };
  }
}