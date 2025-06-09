import { config } from 'dotenv';

config({ path: `.env.${(process.env.NODE_ENV) || 'development'}.local` });

export const {
  PORT, NODE_ENV,
  DB_URI,
  JWT_SECRET, JWT_EXPIRE,
  ARCJET_ENV, ARCJET_KEY,
    QSTASH_TOKEN , QSTASH_URL,
     EMAIL_PASSWORD,
} = process.env;
export const SERVER_URL = process.env.QSTASH_DESTINATION_URL || 'http://localhost:5500';