import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface VenueInput {
  venue_address?: string;
  location?: string;
  capacity?: number | null;
}

export interface CreateVenueInput {
  venue_address: string;
  location: string;
  capacity?: number | null;
}

@Injectable()
export class VenueService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT venue_id, venue_address, location, capacity FROM venue ORDER BY venue_id DESC',
    );
    return rows;
  }

  async findById(venue_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT venue_id, venue_address, location, capacity FROM venue WHERE venue_id = ?',
      [venue_id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Venue #${venue_id} not found`);
    }
    return rows[0];
  }

  async create(data: CreateVenueInput) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      'INSERT INTO venue (venue_address, location, capacity) VALUES (?, ?, ?)',
      [data.venue_address, data.location, data.capacity ?? 1],
    );
    return this.findById(result.insertId);
  }

  async update(venue_id: number, data: VenueInput) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.venue_address !== undefined) {
      fields.push('venue_address = ?');
      values.push(data.venue_address);
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location);
    }
    if (data.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(data.capacity ?? 1);
    }

    if (fields.length > 0) {
      values.push(venue_id);
      const [result] = await this.pool().execute<ResultSetHeader>(
        `UPDATE venue SET ${fields.join(', ')} WHERE venue_id = ?`,
        values,
      );
      if (result.affectedRows === 0) {
        throw new NotFoundException(`Venue #${venue_id} not found`);
      }
    }

    return this.findById(venue_id);
  }

  async remove(venue_id: number) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      'DELETE FROM venue WHERE venue_id = ?',
      [venue_id],
    );
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Venue #${venue_id} not found`);
    }
    return { message: 'Deleted' };
  }
}