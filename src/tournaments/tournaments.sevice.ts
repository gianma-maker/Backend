import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { handleDbError } from '../common/db-error';

export interface TournamentInput {
  tournament_name?: string;
  tournament_date?: string;
  tournament_type?: string;
  status?: string | null;
  venue_id?: number | null;
}

export interface CreateTournamentInput extends TournamentInput {
  tournament_name: string;
  tournament_date: string;
  tournament_type: string;
}

const COLUMNS = `tournament_id, tournament_name,
  DATE_FORMAT(tournament_date, '%Y-%m-%d') AS tournament_date,
  tournament_type, status, venue_id`;

const UPDATABLE: (keyof TournamentInput)[] = [
  'tournament_name',
  'tournament_date',
  'tournament_type',
  'status',
  'venue_id',
];

@Injectable()
export class TournamentsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM tournaments ORDER BY tournament_id DESC`,
    );
    return rows;
  }

  async findById(tournament_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM tournaments WHERE tournament_id = ?`,
      [tournament_id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Tournament #${tournament_id} not found`);
    }
    return rows[0];
  }

  async create(data: CreateTournamentInput) {
    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        `INSERT INTO tournaments
         (tournament_name, tournament_date, tournament_type, status, venue_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.tournament_name,
          data.tournament_date,
          data.tournament_type,
          data.status ?? 'Upcoming',
          data.venue_id ?? null,
        ],
      );
      return this.findById(result.insertId);
    } catch (err) {
      handleDbError(err);
    }
  }

  async update(tournament_id: number, data: TournamentInput) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    for (const col of UPDATABLE) {
      const value = data[col];
      if (value !== undefined) {
        fields.push(`${col} = ?`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      try {
        values.push(tournament_id);
        const [result] = await this.pool().execute<ResultSetHeader>(
          `UPDATE tournaments SET ${fields.join(', ')} WHERE tournament_id = ?`,
          values,
        );
        if (result.affectedRows === 0) {
          throw new NotFoundException(`Tournament #${tournament_id} not found`);
        }
      } catch (err) {
        handleDbError(err);
      }
    }

    return this.findById(tournament_id);
  }

  async remove(tournament_id: number) {
    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        'DELETE FROM tournaments WHERE tournament_id = ?',
        [tournament_id],
      );
      if (result.affectedRows === 0) {
        throw new NotFoundException(`Tournament #${tournament_id} not found`);
      }
      return { message: 'Deleted' };
    } catch (err) {
      handleDbError(err);
    }
  }
}