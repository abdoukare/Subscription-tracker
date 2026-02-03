import express from 'express';
import { config } from 'dotenv';
import arcjetMiddleware from './middlewares/arcjet.js';
import UserRouter from './Routes/User.routes.js';
import AuthRouter from './Routes/auth.routes.js';
import SubscriptionRouter from './Routes/subscription.routes.js';
import WorkflowRouter from './Routes/workflow.js';
import errorMiddleware from './middlewares/error.js';
import pool, { testConnection } from './database/db.js'; // Import pool and testConnection

// Load environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const app = express();

// Middleware
app.use(express.json());
app.use(arcjetMiddleware);

// Routes
app.get('/', (req, res) => {
  res.send('Hey there !');
});

app.use('/api/v1/users', UserRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/subscription', SubscriptionRouter);
app.use('/api/v1/workflow', WorkflowRouter);

// Error handling middleware (should be last)
app.use(errorMiddleware);

// Start server and test database connection
const PORT = process.env.PORT || 5500;

app.listen(PORT, async () => {
  console.log(`Listening on 0.0.0.0:${PORT}`);
  
  // Test database connection
  await testConnection();
});

export default app;