import { Client } from '@upstash/qstash';
import { NODE_ENV } from './env.js';

const isDevelopment = NODE_ENV === 'development';

export const workflowClient = new Client({
    token: process.env.QSTASH_TOKEN,
    baseUrl: isDevelopment 
        ? 'http://127.0.0.1:8080'
        : 'https://qstash.upstash.com',
    retry: {
        retries: 3
    }
});

// Validation
if (!process.env.QSTASH_TOKEN) {
    console.error('⚠️ Missing QSTASH_TOKEN environment variable');
}

console.log(`🚀 QStash configured for ${NODE_ENV} environment`);
