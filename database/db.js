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