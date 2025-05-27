import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
	name: {type: String, required: [true, 'user name is required']},
	email: {type: String, required: [true, 'email is required'], unique: true},
	password: {type: String, required: [true, 'password is required']}
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;