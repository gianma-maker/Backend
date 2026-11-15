import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { handleDbError } from '../common/db-error';

export interface CreateRegistrationDto {
  player_id: number;
  tournament_id: number;
  category: string;
  registration_date?: string;
  status?: string;
}

export interface UpdateRegistrationDto {
  player_id?: number;
  tournament_id?: number;
  category?: string;
  registration_date?: string | null;
  status?: string | null;
}

const COLUMNS = `registration_id, player_id, tournament_id,
  DATE_FORMAT(registration_date, '%Y-%m-%d') AS registration_date,
  category, status`;

const UPDATABLE: (keyof UpdateRegistrationDto)[] = [
  'player_id',
  'tournament_id',
  'category',
  'registration_date',
  'status',
];

@Injectable()
export class RegistrationsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM registrations ORDER BY registration_id DESC`,
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM registrations WHERE registration_id = ?`,
      [id],
    );
    if (!rows[0]) {
      throw new NotFoundException(`Registration #${id} not found`);
    }
    return rows[0];
  }

  async createRegistration(dto: CreateRegistrationDto) {
    try {
      const [result] = await this.pool().execute<ResultSetHeader>(
        `INSERT INTO registrations
         (player_id, tournament_id, category, registration_date, status)
         VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE), COALESCE(?, 'Registered'))`,
        [
          dto.player_id,
          dto.tournament_id,
          dto.category,
          dto.registration_date || null,
          dto.status || null,
        ],
      );
      return this.findById(result.insertId);
    } catch (err) {
      handleDbError(err);
    }
  }

  async updateRegistration(id: number, partial: UpdateRegistrationDto) {
    await this.findById(id);

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    for (const col of UPDATABLE) {
      const value = partial[col];
      if (value !== undefined) {
        fields.push(`${col} = ?`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      try {
        values.push(id);
        await this.pool().execute(
          `UPDATE registrations SET ${fields.join(', ')} WHERE registration_id = ?`,
          values,
        );
      } catch (err) {
        handleDbError(err);
      }
    }

    return this.findById(id);
  }

  async deleteRegistration(id: number) {
    await this.findById(id);
    try {
      await this.pool().execute<ResultSetHeader>(
        'DELETE FROM registrations WHERE registration_id = ?',
        [id],
      );
      return { message: 'Deleted' };
    } catch (err) {
      handleDbError(err);
    }
  }
}