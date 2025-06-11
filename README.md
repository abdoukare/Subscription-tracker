# Subscription Tracker API

A Node.js/Express backend for managing user subscriptions, sending automated renewal reminders, and integrating with Upstash QStash for scheduled workflows.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Users](#users)
  - [Subscriptions](#subscriptions)
  - [Workflow (Reminders)](#workflow-reminders)
- [Reminder Logic](#reminder-logic)
- [QStash Integration](#qstash-integration)
- [Development & Testing](#development--testing)

---

## Overview

Subscription Tracker allows users to manage recurring subscriptions (like Netflix, Prime Video, etc.) and receive automated email reminders before renewals. The system uses Upstash QStash V2 for reliable, scheduled background jobs and reminders.

---

## Tech Stack

- Node.js & Express (API server)
- MongoDB & Mongoose (data storage)
- Upstash QStash V2 (job scheduling & webhooks)
- Nodemailer (email sending)
- Dayjs (date calculations)
- dotenv (environment variables)
- Arcjet (rate limiting & bot protection)

---

## Environment Variables

Create a `.env.development.local` and/or `.env.production.local` file in the root:

```
PORT=5500
SERVER_URL="http://localhost:5500"
NODE_ENV=development
DB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1d
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
QSTASH_URL=http://127.0.0.1:8080
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key
QSTASH_DESTINATION_URL=http://localhost:5500
EMAIL_PASSWORD=your_gmail_app_password
```

---

## Project Structure

- `app.js` - Main Express app
- `Config/` - Configuration (env, nodemailer, upstash, arcjet)
- `Controller/` - Route controllers
- `Routes/` - Express routers
- `models/` - Mongoose models
- `middlewares/` - Express middlewares
- `utils/` - Utility functions (email, templates)
- `database/` - DB connection

---

## API Endpoints

### Auth

| Method | Endpoint              | Description                | Body Params                | Auth Required |
|--------|----------------------|----------------------------|----------------------------|--------------|
| POST   | `/api/v1/auth/sign-up` | Register a new user        | `{ name, email, password }`| No           |
| POST   | `/api/v1/auth/sign-in` | Login                      | `{ email, password }`      | No           |
| POST   | `/api/v1/auth/sign-out`| Logout (clear cookie)      | -                          | No           |

---

### Users

| Method | Endpoint                | Description                | Auth Required |
|--------|-------------------------|----------------------------|--------------|
| GET    | `/api/v1/users/`        | Get all users              | No           |
| GET    | `/api/v1/users/:id`     | Get user by ID             | Yes          |
| POST   | `/api/v1/users/`        | Create user (not used)     | No           |
| PUT    | `/api/v1/users/:id`     | Update user (not used)     | No           |
| DELETE | `/api/v1/users/:id`     | Delete user (not used)     | No           |

---

### Subscriptions

| Method | Endpoint                                 | Description                       | Auth Required |
|--------|------------------------------------------|-----------------------------------|--------------|
| GET    | `/api/v1/subscription/`                  | Get all subscriptions (stub)      | No           |
| GET    | `/api/v1/subscription/:id`               | Get subscription by ID (stub)     | No           |
| POST   | `/api/v1/subscription/`                  | Create a new subscription         | Yes          |
| PUT    | `/api/v1/subscription/:id`               | Update subscription (stub)        | No           |
| DELETE | `/api/v1/subscription/:id`               | Delete subscription (stub)        | No           |
| GET    | `/api/v1/subscription/user/:id`          | Get subscriptions for a user      | Yes          |
| PUT    | `/api/v1/subscription/:id/cancel`        | Cancel subscription (stub)        | No           |
| GET    | `/api/v1/subscription/upcoming-renewals` | Get upcoming renewals (stub)      | No           |

#### Create Subscription Example

**POST** `/api/v1/subscription/`  
Headers: `Authorization: Bearer <token>`  
Body:
```json
{
  "name": "Netflix",
  "price": 12.99,
  "frequency": "monthly",
  "category": "Entertainment",
  "paymentMethod": "Visa",
  "startDate": "2024-06-01",
  "renewalDate": "2024-07-01"
}
```

---

### Workflow (Reminders)

| Method | Endpoint                                         | Description                        | Auth Required |
|--------|--------------------------------------------------|------------------------------------|--------------|
| POST   | `/api/v1/workflow/subscription/reminder`         | QStash webhook for reminders       | QStash only  |

This endpoint is called by QStash to process and send reminder emails for subscriptions.

---

## Reminder Logic

- When a subscription is created, a QStash workflow is scheduled to check daily for upcoming renewals.
- Reminder emails are sent at 7, 5, 2, and 1 days before the renewal date.
- Email templates are customizable in [`utils/template-email.js`](utils/template-email.js).

---

## QStash Integration

- Uses [`@upstash/qstash`](https://upstash.com/docs/qstash) for scheduled jobs.
- Webhook signature is verified in [`middlewares/verfication.js`](middlewares/verfication.js).
- Workflow logic is in [`Controller/workflow.controller.js`](Controller/workflow.controller.js).

---

## Development & Testing

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env.development.local` file.
3. Start the server:
   ```sh
   npm run dev
   ```
4. Use Postman or similar to test endpoints.

---

## License

MIT

---

## Authors

- [Abdou Kadjoudj]
