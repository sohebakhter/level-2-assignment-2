# DevPulse

Live URL: https://soheb-devpulse.vercel.app

## Features

- User registration and login (JWT-based authentication)
- Create issues (bug or feature request)
- Role-based access (contributor, maintainer)
- Input validation and DB constraints for data integrity

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg (node-postgres)
- JSON Web Tokens (JWT)

## Setup

Prerequisites:

- Node.js 18+ and npm
- PostgreSQL

Steps:

1. Clone the repo:

```bash
git clone https://github.com/sohebakhter/level-2-assignment-2.git
cd level-2-assignment-2
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with the following variables:

```
CONNECTION_STRING=postgresql://user:password@host:port/dbname
PORT=4000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

4. Start the server in development:

```bash
npm run dev
```

Note: The project uses `src/server.ts` as the entry point for `tsx` watch in development.

## API Endpoints

Base URL: `/api`

- POST `/api/auth/signup`
  - Registers a new user.
  - Body (application/json):
    ```json
    { "name": "Alice", "email": "alice@example.com", "password": "secret" }
    ```

- POST `/api/auth/login`
  - Logs in a user and returns a JWT.
  - Body (application/json):
    ```json
    { "email": "alice@example.com", "password": "secret" }
    ```

- POST `/api/issues`
  - Creates a new issue. Protected route — requires `Authorization` header with `Bearer <token>`.
  - Body (application/json):

    ```json
    {
      "title": "Page crashes on submit",
      "description": "When I submit the form the app crashes with stack trace... (min 20 chars)",
      "type": "bug",
      "status": "open" // optional
    }
    ```

  - Response: returns the created issue object.

## Database Schema Summary

- `users` table
  - `id` (SERIAL PRIMARY KEY)
  - `name` VARCHAR(255) NOT NULL
  - `email` VARCHAR(255) NOT NULL UNIQUE
  - `password` VARCHAR(255) NOT NULL
  - `role` VARCHAR(20) NOT NULL DEFAULT 'contributor' (CHECK role IN ('contributor','maintainer'))
  - `created_at`, `updated_at` TIMESTAMP

- `issues` table
  - `id` (SERIAL PRIMARY KEY)
  - `title` VARCHAR(150) NOT NULL
  - `description` TEXT NOT NULL (CHECK LENGTH(description) >= 20)
  - `type` VARCHAR(20) NOT NULL (CHECK type IN ('bug','feature_request'))
  - `status` VARCHAR(20) DEFAULT 'open' (CHECK status IN ('open','in_progress','resolved'))
  - `reporter_id` INTEGER (references `users.id` implicitly; add FK if desired)
  - `created_at`, `updated_at` TIMESTAMP

## Notes

- Replace the Live URL and `.env` values with real deployment values.
- If you want foreign key enforcement, add `FOREIGN KEY (reporter_id) REFERENCES users(id)` to the `issues` table.

---
