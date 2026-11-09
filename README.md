# Sweety — Blood Glucose Tracker

A full-stack blood glucose tracking application. Users can register, log in, record daily glucose readings, manage those readings, and view daily, month-to-date, and previous-month reports.

## Features

- User registration and login with JWT authentication
- Add, edit, view, and delete glucose readings
- Four reading slots per day: morning fasting, after breakfast, after lunch, and after dinner
- Daily glucose report with highest, lowest, and average values
- Month-to-date and previous-month reports
- Protected dashboard for authenticated users
- Responsive React frontend

## Tech stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, React Router, Vite, CSS                      |
| Backend    | Node.js, Express 5, JSON Web Tokens, bcrypt             |
| Database   | PostgreSQL (`pg` driver)                               |
| Dev tools  | Nodemon, ESLint                                        |

## Project structure

```text
Sweety-Blood-Glucose-Tracker/
├── backend/
│   ├── src/
│   │   ├── config/db.js               # PostgreSQL connection pool
│   │   ├── controllers/               # Auth, readings, and report logic
│   │   ├── middleware/authMiddleware.js
│   │   ├── routes/                    # API routes
│   │   ├── app.js                     # Express app and route registration
│   │   └── server.js                  # Server entry point
│   ├── .env                           # Local environment variables (not committed)
│   ├── .env.example                   # Template for local environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                # Reading forms, reports, route guard
│   │   ├── pages/                     # Login, Register, Dashboard
│   │   ├── services/api.js            # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                           # Local frontend environment variables (not committed)
│   ├── .env.example                   # Template for frontend environment variables
│   ├── index.html
│   └── package.json
└── README.md
```

## Prerequisites

Before starting, install:

- [Node.js](https://nodejs.org/) 20.19+ (or 22.12+) with npm
- [PostgreSQL](https://www.postgresql.org/download/) 14 or newer
- Git

Check your versions:

```bash
node --version
npm --version
psql --version
```

---

## 1. Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
git clone <your-repository-url>
cd Sweety-Blood-Glucose-Tracker

cd backend
npm install

cd ../frontend
npm install
```

Return to the project root when done:

```bash
cd ..
```

Then create your environment files from the provided examples (see [Environment variables](#3-environment-variables)):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## 2. Database setup

The project connects directly to PostgreSQL using the `pg` package. There is no migration tool configured, so create the database and tables manually with the steps below.

### 2.1 Create the database and database user

Open PostgreSQL's interactive shell as the `postgres` superuser:

```bash
sudo -u postgres psql
```

Run the following SQL, replacing `change-me` with a password of your choice:

```sql
CREATE ROLE sweety_app WITH LOGIN PASSWORD 'change-me';
CREATE DATABASE sweety_db OWNER sweety_app;
\q
```

> On macOS, you may need to run `psql postgres` instead of using `sudo -u postgres psql`.

### 2.2 Create the tables

Connect to the new database:

```bash
psql -U sweety_app -d sweety_db -h localhost
```

Paste the following SQL into the `psql` prompt and press Enter:

```sql
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glucose_readings (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date  DATE NOT NULL,
    slot          TEXT NOT NULL CHECK (
        slot IN (
            'morning_fasting',
            'after_breakfast',
            'after_lunch',
            'after_dinner'
        )
    ),
    glucose_value INTEGER NOT NULL CHECK (glucose_value BETWEEN 40 AND 600),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, reading_date, slot)
);

CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_date
    ON glucose_readings (user_id, reading_date DESC);
```

Exit the shell:

```text
\q
```

### 2.3 Verify the connection

Start the backend (see [Running the server](#4-running-the-server)) and open:

```bash
curl http://localhost:5000/api/db-health
```

A successful response looks like:

```json
{
  "success": true,
  "message": "Database connection successful",
  "databaseTime": "2026-11-09T10:00:00.000Z"
}
```

---

## 3. Environment variables

### 3.1 Backend

Copy the example file and edit the values:

```bash
cp backend/.env.example backend/.env
```

The resulting `backend/.env` should look like this (`.env` is gitignored and should not be committed):

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=sweety_app
DB_PASSWORD=change-me

JWT_SECRET=replace-with-a-long-random-secret
```

> **Important:** The backend reads `DB_PASSWORD` and `JWT_SECRET`. Make sure those exact variable names are used. A missing `JWT_SECRET` will cause login to fail, and an incorrectly named password variable will prevent the database connection.

To generate a random JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output into `JWT_SECRET`.

### 3.2 Frontend

Copy the frontend example file:

```bash
cp frontend/.env.example frontend/.env
```

The resulting `frontend/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Change this value if the backend runs on a different host or port. Restart the Vite dev server after changing it.

> **Important:** Vite only exposes variables prefixed with `VITE_`, and those values are bundled into the client. Never put secrets in `frontend/.env`.

---

## 4. Running the server

### 4.1 Start the backend

Open a terminal:

```bash
cd backend
npm run dev
```

The API starts at **http://localhost:5000**.

To run without Nodemon's file watching:

```bash
npm start
```

Useful backend endpoints:

```bash
# API status
curl http://localhost:5000/api/health

# Database status
curl http://localhost:5000/api/db-health
```

### 4.2 Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Vite starts the client at **http://localhost:5173** by default.

Open the app and use:

- `/register` — create a new account
- `/login` — sign in
- `/dashboard` — view and manage readings and reports

Keep both terminals running while using the app.

### 4.3 Production frontend build

```bash
cd frontend
npm run build
npm run preview
```

The production assets are written to `frontend/dist/`.

---

## 5. Running tests

### Automated tests

This repository does **not currently include an automated test suite**, and neither `backend/package.json` nor `frontend/package.json` defines a `test` script. Running `npm test` now will not run any tests.

When tests are added, run them from each package:

```bash
# Backend tests (once configured)
cd backend
npm test

# Frontend tests (once configured)
cd frontend
npm test
```

Typical choices for adding tests later are Jest + Supertest for the backend and Vitest + React Testing Library for the frontend.

### Manual smoke tests

Use these steps to verify the API and database are working.

1. **Check the API and database:**

   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/db-health
   ```

2. **Register a test user:**

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

3. **Log in and copy the returned token:**

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

4. **Add a reading** (set `TOKEN` to the token from the login response, and use today's date or a past date):

   ```bash
   TOKEN="<paste-token-here>"

   curl -X POST http://localhost:5000/api/readings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"readingDate":"2026-11-09","slot":"morning_fasting","glucoseValue":95}'
   ```

5. **Fetch readings and reports:**

   ```bash
   curl http://localhost:5000/api/readings \
     -H "Authorization: Bearer $TOKEN"

   curl "http://localhost:5000/api/reports/daily?date=2026-11-09" \
     -H "Authorization: Bearer $TOKEN"

   curl http://localhost:5000/api/reports/month-to-date \
     -H "Authorization: Bearer $TOKEN"

   curl http://localhost:5000/api/reports/previous-month \
     -H "Authorization: Bearer $TOKEN"
   ```

6. **Run the frontend linter** (static checks, not unit tests):

   ```bash
   cd frontend
   npm run lint
   ```

---

## API reference

All reading and report routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint                       | Description                            |
| ------ | ------------------------------ | -------------------------------------- |
| POST   | `/api/auth/register`           | Register a new user                    |
| POST   | `/api/auth/login`              | Log in and receive a JWT               |
| GET    | `/api/auth/protected`          | Verify a token                         |
| GET    | `/api/health`                  | API health check                       |
| GET    | `/api/db-health`               | Database health check                  |
| GET    | `/api/readings`                | List the current user's readings       |
| POST   | `/api/readings`                | Add a reading                          |
| PUT    | `/api/readings/:id`            | Update a reading                       |
| DELETE | `/api/readings/:id`            | Delete a reading                       |
| GET    | `/api/reports/daily?date=...`  | Daily report for a `YYYY-MM-DD` date    |
| GET    | `/api/reports/month-to-date`   | Report from the start of the current month |
| GET    | `/api/reports/previous-month`  | Report for the previous month          |

### Reading validation rules

- `readingDate` must use `YYYY-MM-DD` and cannot be in the future.
- `slot` must be one of `morning_fasting`, `after_breakfast`, `after_lunch`, or `after_dinner`.
- `glucoseValue` must be an integer between `40` and `600`.
- A user can have only one reading per slot per date.

---

## Troubleshooting

| Problem                                      | Solution                                                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED` or database connection failed | Ensure PostgreSQL is running and that `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` are correct. |
| `password authentication failed`             | Verify the PostgreSQL role password and the value of `DB_PASSWORD`.                                       |
| Login returns `500`                          | Confirm `JWT_SECRET` is set in `backend/.env`.                                                            |
| API requests return `401`                    | Log in again — tokens expire after one hour.                                                              |
| Frontend cannot reach the API                | Start the backend on port `5000`, then check `VITE_API_BASE_URL` in `frontend/.env` (or the fallback in `frontend/src/services/api.js`). |
| Port already in use                          | Stop the conflicting process or change `PORT` in `backend/.env`.                                          |
| CORS errors                                  | Confirm the backend is running and reachable at the URL used by `frontend/src/services/api.js`.           |

---

## License

This project is licensed under the ISC License.
