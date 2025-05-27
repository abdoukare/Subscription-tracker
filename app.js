import express from 'express';
import {PORT} from './Config/env.js';
import UserRouter from './Routes/User.routes.js';
import AuthRouter from './Routes/auth.routes.js';
import SubscriptionRouter from './Routes/subscription.routes.js';
import connectDB from './database/db.js';
import errorMiddleware from './middlewares/error.js';
import cookieParser from 'cookie-parser';
import arcjet from '@arcjet/node';
import arcjetMiddleware from './middlewares/arcjet.js';
import WorkflowRouter from "./Routes/workflow.js";
const app = express(); 
app.use(express.json());
app.use(express.urlencoded({extended: false})); // to prosess form data snet via post request html
app.use(cookieParser());
app.use(arcjetMiddleware);
app.get('/', (req, res) => {
	res.send('Hey there !');
});
try{
	app.use('/api/v1/users', UserRouter);
	app.use('/api/v1/auth', AuthRouter);
	app.use('/api/v1/subscription', SubscriptionRouter);
	app.use('/api/v1/workflow', WorkflowRouter);
}catch(err){
	res.send(err);
}
app.use(errorMiddleware);
app.listen(5500,async()=>{
	console.log(`Server is running on http://localhost:${PORT}`);
	await connectDB();
});

export default app;