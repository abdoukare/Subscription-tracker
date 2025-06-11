Subscription Tracker
A Node.js/Express backend for managing user subscriptions, sending automated renewal reminders, and integrating with Upstash QStash for scheduled workflows.

Table of Contents
Overview
Features
Tech Stack
Project Structure
Environment Variables
How It Works
API Endpoints
QStash Integration
Reminder Logic
Development & Testing
Deployment
Troubleshooting
Overview
Subscription Tracker allows users to manage their recurring subscriptions (like Netflix, Prime Video, etc.), and receive automated email reminders before their subscriptions renew. The system uses Upstash QStash V2 for reliable, scheduled background jobs and reminders.

Features
User authentication and authorization
CRUD operations for subscriptions
Automated daily checks for upcoming renewals
Customizable reminder days (e.g., 7, 5, 3, 1 days before renewal)
Email notifications for upcoming renewals
Secure webhook verification for QStash
Environment-based configuration (development/production)
Tech Stack
Node.js & Express (API server)
MongoDB (data storage)
Mongoose (ODM)
Upstash QStash V2 (job scheduling & webhooks)
Nodemailer (email sending)
Dayjs (date calculations)
dotenv (environment variables)