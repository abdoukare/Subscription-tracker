import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../Config/env.js';
import User from '../models/user.model.js';

const authorize = async (req, res, next) => {
	try{
		let token;
		if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
			token = req.headers.authorization.split(' ')[1];
		}
		if(!token){
			return res.status(401).json({message:'unauthorized'});
		}
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.id);
		if(!user){
			return res.status(401).json({message:'unauthorized'});
		}
		req.user = user;
		next();
	}catch(error){
		res.status(401).json({message:'unauthorized', error: error.message});
	}
} 
export default authorize;
// this middleware is trying to find the user based of the user token that tries to make the request it looks if its there and it decodees it , 
// it verifies that is the user the currently loged in
//  and then it attaches the req so later we can know who is exatly making the request