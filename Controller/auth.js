import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_EXPIRE, JWT_SECRET } from '../Config/env.js';
import pool from '../database/db.js';

// sign up a new user
// POST /api/v1/auth/signup
export const signUp = async (req, res, next) => {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN'); // Start transaction (atomic operation - ya ykhdm klch ya may5d, walo)
		
		const { name, email, password } = req.body; // extracting user data from req body
		
		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			const error = new Error('User already exists');
			error.statusCode = 409;
			throw error;
		}
		
		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		
		// Create new user with client transaction
		const newUser = await User.create(
			{ name, email, password: hashedPassword },
			client
		);
		
		// Generate token (using id instead of _id for PostgreSQL)
		const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
		
		await client.query('COMMIT'); // Commit transaction
		
		res.status(201).json({
			success: true,
			message: 'User created successfully',
			data: newUser,
			token
		});
	} catch (error) {
		await client.query('ROLLBACK'); // Rollback transaction on error
		next(error);
	} finally {
		client.release(); // Release client back to pool
	}
};

export const signIn = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		
		// Find user with password included (true flag)
		const user = await User.findOne({ email }, true);
		
		if (!user) {
			const error = new Error('User not found');
			error.statusCode = 401;
			throw error;
		}
		
		// Compare password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			const error = new Error('Invalid password');
			error.statusCode = 401;
			throw error;
		}
		
		// Generate token (using id instead of _id for PostgreSQL)
		const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
		
		// Remove password from response
		const userWithoutPassword = User.excludePassword(user);
		
		res.status(200).json({
			success: true,
			message: 'User logged in successfully',
			data: [userWithoutPassword, token]
		});
	} catch (error) {
		next(error);
	}
};

export const signOut = async (req, res, next) => {
	try {
		res.clearCookie('token');
		res.status(200).json({
			success: true,
			message: 'User logged out successfully'
		});
	} catch (error) {
		next(error);
	}
};