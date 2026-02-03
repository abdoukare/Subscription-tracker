/*

import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
	name: {type: String, required: [true, 'user name is required']},
	email: {type: String, required: [true, 'email is required'], unique: true},
	password: {type: String, required: [true, 'password is required']}
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;

*/

import pool from '../database/db.js';

class User {
  // Create a new user
  static async create({ name, email, password }, client = null) {
    const db = client || pool;
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at, updated_at
    `;
    const values = [name, email, password];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        const err = new Error('Email already exists');
        err.statusCode = 409;
        throw err;
      }
      throw error;
    }
  }

  // Find all users
  static async find() {
    const query = 'SELECT id, name, email, created_at, updated_at FROM users';
    const result = await pool.query(query);
    return result.rows;
  }

  // Find user by ID
  static async findById(id, includePassword = false) {
    const fields = includePassword 
      ? 'id, name, email, password, created_at, updated_at'
      : 'id, name, email, created_at, updated_at';
    
    const query = `SELECT ${fields} FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find user by email
  static async findOne({ email }, includePassword = false) {
    const fields = includePassword 
      ? 'id, name, email, password, created_at, updated_at'
      : 'id, name, email, created_at, updated_at';
    
    const query = `SELECT ${fields} FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Update user
  static async findByIdAndUpdate(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete user
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Helper to exclude password from object
  static excludePassword(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default User;