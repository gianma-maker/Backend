import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class VenueService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

 async createUser(venue_address: string, location: string, capacity: number) {
  const [result] = await this.pool().execute<OkPacket>(
    'INSERT INTO venue (venue_address, location, capacity) VALUES (?, ?, ?)',
    [venue_address, location, capacity],
  );

  return {
    venue_id: result.insertId,
    venue_address,
    location,
    capacity,
  };
}

  async findByUsername(venue_id: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT venue_id, venue_address, location, capacity FROM venue WHERE venue_id = ?',
      [venue_id],
    );
    return rows[0];
  }

  async findByaddress(venue_address: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT venue_id, venue_address, location, capacity FROM venue WHERE venue_address = ?',
      [venue_address],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT venue_id, venue_address, location, capacity FROM venue',
    );
    return rows;
  }

  async updateUser(venue_address: string, partial: { venue_address?: string; location?: string; capacity?: number }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.venue_address) {
      fields.push('venue_address = ?');
      values.push(partial.venue_address);
    }

    if (partial.location) {
      fields.push('location = ?');
      values.push(partial.location);
    }

    if (partial.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(partial.capacity);
    }

    if (fields.length === 0) return await this.findByaddress(venue_address);

    values.push(venue_address);

    const sql = `UPDATE venue SET ${fields.join(', ')} WHERE venue_id = ?`;

    await this.pool().execute(sql, values);

    return this.findByaddress(venue_address);
  }

  async deleteUser(venue_id: string) {
  const [res] = await this.pool().execute<OkPacket>(
    'DELETE FROM venue WHERE venue_id = ?',
    [venue_id],
  );

  return res.affectedRows > 0;
}

  async setRefreshToken(venue_id: string, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE venue SET refresh_token = ? WHERE venue_id = ?',
      [refreshToken, venue_id],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT venue_id, venue_address, location, capacity FROM venue WHERE refresh_token = ?',
      [refreshToken],
    );

    return rows[0];
  }
}