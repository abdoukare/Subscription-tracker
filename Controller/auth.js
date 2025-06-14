import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_EXPIRE, JWT_SECRET } from '../Config/env.js';
import error from "../middlewares/error.js";

// sign up a new user
// POST /api/v1/auth/signup
export const signUp = async (req, res, next) => {
	const session = await mongoose.startSession();// starting monodb session
	session.startTransaction(); // start a transaction ( atomic operation ) ya ykhdm klch ya may5d, walo 
	try{
		// create new user
		const {name, email, password} = req.body; // extracting user data from req body
		const existingUser = await User.findOne({email});
		if(existingUser){
			error.statusCode = 409;
		}
		// hash password 
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = await User.create([{name, email, password: hashedPassword}], {session}); // new user in the current session with hashed password
		const token = jwt.sign({id: newUser[0]._id}, JWT_SECRET, {expiresIn: JWT_EXPIRE});// giving him a token
		await session.commitTransaction();
		session.endSession();
		res.status(201).json({
			success: true,
			message: 'User created successfully',
			data: {
				User : newUser,
				token: token}
		});
	}catch(error){
		await session.abortTransaction(); // if anything fault happen abort transaction
		session.endSession();
		next(error);
	}
};

export const signIn = async (req, res, next) => {
	try{
		const {email, password} = req.body;
		const user = await User.findOne({email});
		if(!user){
			const error = new Error('User not found');
			error.statusCode = 401;
			throw error;
		}
		// compare password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if(!isPasswordValid){
			const error = new Error('Invalid password');
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: JWT_EXPIRE});
		res.status(200).json({
			success: true,
			message: 'User logged in successfully',
			data: [
				user, 
				token
			]});
	}catch(error){
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
	}catch (error){
		next(error);
	}

};
