import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PlayersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE
  async createUser(
    player_id: string,
    first_name: string,
    last_name: string,
    gender: string,
    birth_date: string,
    contact_number: string,
    ranking_points: number | null,
  ) {
    await this.pool().execute<OkPacket>(
      `INSERT INTO players
      (player_id, first_name, last_name, gender, birth_date, contact_number, ranking_points)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        player_id,
        first_name,
        last_name,
        gender,
        birth_date,
        contact_number,
        ranking_points,
      ],
    );

    return {
      player_id,
      first_name,
      last_name,
    };
  }

  // GET ONE
  async findById(player_id: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT player_id, first_name, last_name, gender, birth_date,
      contact_number, ranking_points
      FROM players
      WHERE player_id = ?`,
      [player_id],
    );

    return rows[0];
  }

  // GET ALL
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT player_id, first_name, last_name, gender, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date,
      contact_number, ranking_points
      FROM players`,
    );

    return rows;
  }

  // UPDATE
  async updateUser(
    player_id: string,
    partial: {
      player_id?: string;
      first_name?: string;
      last_name?: string;
      gender?: string;
      birth_date?: string;
      contact_number?: string;
      ranking_points?: number | null;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.player_id !== undefined) {
      fields.push('player_id = ?');
      values.push(partial.player_id);
    }

    if (partial.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(partial.first_name);
    }

    if (partial.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(partial.last_name);
    }

    if (partial.gender !== undefined) {
      fields.push('gender = ?');
      values.push(partial.gender);
    }

    if (partial.birth_date !== undefined) {
      fields.push('birth_date = ?');
      values.push(partial.birth_date);
    }

    if (partial.contact_number !== undefined) {
      fields.push('contact_number = ?');
      values.push(partial.contact_number);
    }

    if (partial.ranking_points !== undefined) {
      fields.push('ranking_points = ?');
      values.push(partial.ranking_points);
    }

    if (fields.length === 0) {
      return this.findById(player_id);
    }

    values.push(player_id);

    await this.pool().execute(
      `UPDATE players
       SET ${fields.join(', ')}
       WHERE player_id = ?`,
      values,
    );

    return this.findById(partial.player_id ?? player_id);
  }

  // DELETE
  async deleteUser(player_id: string) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM players WHERE player_id = ?',
      [player_id],
    );

    return {
      success: result.affectedRows > 0,
      message:
        result.affectedRows > 0
          ? 'Player deleted successfully'
          : 'Player not found',
    };
  }
}