/*
import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => { // fetch all users
	try{
		const users = await User.find();
		res.status(200).json({
			success: true,
			message: 'All users',
			data: users
		});
	}catch(error){
		next(error);
	}
}

export const getUser = async (req, res, next) => {
	try{
		const user = await User.findById(req.params.id).select('-password'); // exclude password from the response
		if(!user){
			res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}
		res.status(200).json({success: true, data: user});
	}catch(error){
		next(error);
	}
}
	*/

import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            message: 'All users',
            data: users
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id); // Password excluded by default
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        // Prevent password updates through this endpoint
        const { password, ...updateData } = req.body;
        
        const user = await User.findByIdAndUpdate(req.params.id, updateData);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User updated successfully',
            data: user 
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User deleted successfully',
            data: user 
        });
    } catch (error) {
        next(error);
    }
};