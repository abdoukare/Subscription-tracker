const errorMiddleware = (err, req, res, next) => {
	try{
		let error = {...err};
		error.message = err.message;
		console.error(err);
		// Mongoose bad ObjectId
		if(err.name === 'CastError'){
			error.message = `Resource not found with id of ${err.value}`;
			error.statusCode = 404;
		}
		// Mongoose duplicate key
		if(err.code === 11000){
			error.message = 'Duplicate field value entered';
			error.statusCode = 400;
		}
		// Mongoose validation error
		if(err.name === 'ValidationError'){
			const messages = Object.values(err.errors).map(val => val.message);
			error = new Error(`Invalid input data. ${messages.join('. ')}`);
			error.statusCode = 400;
		}
		res.status(error.statusCode || 500).json({
			success: false,
			error: error.message || 'Server Error'
		});
	}catch(error){
		next(error);
	}
};

export default errorMiddleware;