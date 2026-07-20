# Star Police Academy - Backend API

Node.js + Express + MongoDB backend for the admin and student panels.

## Requirements

- Node.js 18+
- MongoDB 7+ running locally or MongoDB Atlas connection string

## Setup

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for auth tokens |
| `CLIENT_URL` | Frontend URL for CORS |

## Default users (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@starpolice.academy | admin123 |
| Student | student@starpolice.academy | student123 |

## API endpoints

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `GET /api/uploads?date=YYYY-MM-DD` - List uploads
- `POST /api/uploads` - Upload files (admin)
- `DELETE /api/uploads/:id` - Delete upload (admin)
- `GET /api/messages` - Chat messages
- `POST /api/messages` - Send message
- `GET /api/dashboard/stats` - Admin dashboard stats

## Run with frontend

From project root:

```bash
# Terminal 1 - API
cd server && npm run dev

# Terminal 2 - Frontend
cd package && npm run dev
```

Frontend proxies `/api` and `/uploads` to the backend via Vite.
