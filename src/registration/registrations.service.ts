import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
  registration_date?: string;
  status?: string;
}

@Injectable()
export class RegistrationsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // Create new registration record in registrations table
  async createRegistration(dto: CreateRegistrationDto) {
    const { player_id, tournament_id, category, registration_date, status } = dto;

    const sql = `
      INSERT INTO registrations (player_id, tournament_id, category, registration_date, status)
      VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE), COALESCE(?, 'Registered'))
    `;

    const [result] = await this.pool().execute<ResultSetHeader>(sql, [
      player_id,
      tournament_id,
      category,
      registration_date || null,
      status || null,
    ]);

    return this.findById(result.insertId);
  }

  // Get single registration from registrations table by ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM registrations WHERE registration_id = ?',
      [id],
    );
    if (!rows[0]) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    return rows[0];
  }

  // Get all records from registrations table
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM registrations',
    );
    return rows;
  }

  // Update registration record in registrations table
  async updateRegistration(id: number, partial: UpdateRegistrationDto) {
    await this.findById(id);

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.player_id !== undefined) {
      fields.push('player_id = ?');
      values.push(partial.player_id);
    }
    if (partial.tournament_id !== undefined) {
      fields.push('tournament_id = ?');
      values.push(partial.tournament_id);
    }
    if (partial.category !== undefined) {
      fields.push('category = ?');
      values.push(partial.category);
    }
    if (partial.registration_date !== undefined) {
      fields.push('registration_date = ?');
      values.push(partial.registration_date);
    }
    if (partial.status !== undefined) {
      fields.push('status = ?');
      values.push(partial.status);
    }

    if (fields.length === 0) return await this.findById(id);

    values.push(id);
    const sql = `UPDATE registrations SET ${fields.join(', ')} WHERE registration_id = ?`;
    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  // Delete registration record from registrations table
  async deleteRegistration(id: number) {
    await this.findById(id);
    const [res] = await this.pool().execute<ResultSetHeader>(
      'DELETE FROM registrations WHERE registration_id = ?',
      [id],
    );
    return res.affectedRows > 0;
  }
}