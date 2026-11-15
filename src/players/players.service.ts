import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { handleDbError } from '../common/db-error';

export interface PlayerInput {
  user_id?: number | null;
  first_name?: string;
  last_name?: string;
  gender?: string;
  birth_date?: string | null;
  contact_number?: string | null;
  ranking_points?: number | null;
}

export interface CreatePlayerInput extends PlayerInput {
  first_name: string;
  last_name: string;
  gender: string;
}

const COLUMNS = `player_id, user_id, first_name, last_name, gender,
  DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date,
  contact_number, ranking_points`;

const UPDATABLE: (keyof PlayerInput)[] = [
  'user_id',
  'first_name',
  'last_name',
  'gender',
  'birth_date',
  'contact_number',
  'ranking_points',
];

@Injectable()
export class PlayersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM players ORDER BY player_id DESC`,
    );
    return rows;
  }

  async findById(player_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM players WHERE player_id = ?`,
      [player_id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Player #${player_id} not found`);
    }
    return rows[0];
  }

  async create(data: CreatePlayerInput) {
    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        `INSERT INTO players
         (user_id, first_name, last_name, gender, birth_date, contact_number, ranking_points)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.user_id ?? null,
          data.first_name,
          data.last_name,
          data.gender,
          data.birth_date ?? null,
          data.contact_number ?? null,
          data.ranking_points ?? 0,
        ],
      );
      return this.findById(result.insertId);
    } catch (err) {
      handleDbError(err);
    }
  }

  async update(player_id: number, data: PlayerInput) {
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
        values.push(player_id);
        const [result] = await this.pool().execute<ResultSetHeader>(
          `UPDATE players SET ${fields.join(', ')} WHERE player_id = ?`,
          values,
        );
        if (result.affectedRows === 0) {
          throw new NotFoundException(`Player #${player_id} not found`);
        }
      } catch (err) {
        handleDbError(err);
      }
    }

    return this.findById(player_id);
  }

  async remove(player_id: number) {
    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        'DELETE FROM players WHERE player_id = ?',
        [player_id],
      );
      if (result.affectedRows === 0) {
        throw new NotFoundException(`Player #${player_id} not found`);
      }
      return { message: 'Deleted' };
    } catch (err) {
      handleDbError(err);
    }
  }
}