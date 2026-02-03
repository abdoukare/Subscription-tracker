/*
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { DB_URI, NODE_ENV} from '../Config/env.js';
console.log('DB_URI:', DB_URI); // Debugging
if(!DB_URI){
	throw new Error('Please provide a valid URI');
}

const connectDB = async () => {
	try {
		await mongoose.connect(DB_URI);
	  console.log(`MongoDB connected to ${NODE_ENV} environment`);
	} catch (error) {
	  console.error(`Error: ${error.message}`);
	  process.exit(1);
	}
  };
export default connectDB;
*/

import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'subscription_tracker',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default pool;