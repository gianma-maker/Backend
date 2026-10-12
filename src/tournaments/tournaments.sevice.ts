import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class TournamentsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createUser(
    tournament_id: string,
    tournament_name: string,
    tournament_date: string,
    tournament_type: string,
  ) {
    await this.pool().execute<OkPacket>(
      `INSERT INTO tournaments
      (tournament_id, tournament_name, tournament_date, tournament_type)
      VALUES (?, ?, ?, ?)`,
      [
        tournament_id,
        tournament_name,
        tournament_date,
        tournament_type,
      ],
    );

    return {
      tournament_id,
      tournament_name,
      tournament_date,
      tournament_type,
    };
  }

  async findByUsername(tournament_name: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT tournament_id, tournament_name, tournament_date,
      tournament_type, status
      FROM tournaments
      WHERE tournament_name = ?`,
      [tournament_name],
    );

    return rows[0];
  }

  async findById(tournament_id: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT tournament_id, tournament_name,
      DATE_FORMAT(tournament_date, '%Y-%m-%d') AS tournament_date,
      tournament_type, status
      FROM tournaments
      WHERE tournament_id = ?`,
      [tournament_id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT tournament_id, tournament_name,
      DATE_FORMAT(tournament_date, '%Y-%m-%d') AS tournament_date,
      tournament_type, status
      FROM tournaments`,
    );

    return rows;
  }

  async updateUser(
    tournament_id: string,
    partial: {
      tournament_id?: string;
      tournament_name?: string;
      tournament_date?: string;
      tournament_type?: string;
      status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.tournament_id !== undefined) {
      fields.push('tournament_id = ?');
      values.push(partial.tournament_id);
    }

    if (partial.tournament_name !== undefined) {
      fields.push('tournament_name = ?');
      values.push(partial.tournament_name);
    }

    if (partial.tournament_date !== undefined) {
      fields.push('tournament_date = ?');
      values.push(partial.tournament_date);
    }

    if (partial.tournament_type !== undefined) {
      fields.push('tournament_type = ?');
      values.push(partial.tournament_type);
    }

    if (partial.status !== undefined) {
      fields.push('status = ?');
      values.push(partial.status);
    }

    if (fields.length === 0) {
      return this.findById(tournament_id);
    }

    values.push(tournament_id);

    const sql = `
      UPDATE tournaments
      SET ${fields.join(', ')}
      WHERE tournament_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(partial.tournament_id ?? tournament_id);
  }

  async deleteUser(tournament_id: string) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM tournaments WHERE tournament_id = ?',
      [tournament_id],
    );

    return res.affectedRows > 0;
  }
}