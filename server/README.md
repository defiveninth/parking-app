# Parking App API (Express + PostgreSQL)

Backend for the parking app: auth, parking spots, bookings, and user profile.

## Setup

1. **PostgreSQL**  
   Create a database, e.g.:
   ```bash
   createdb parking_app
   ```

2. **Environment**  
   Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` – e.g. `postgres://user:password@localhost:5432/parking_app`
   - `JWT_SECRET` – secret for JWT signing
   - `PORT` – optional (default 4000)

3. **Install and init DB**
   ```bash
   cd server
   npm install
   npm run db:init
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   API base: `http://localhost:4000`

## API

Base URL: `http://localhost:4000/api`

### Auth (no token)

- `POST /auth/register` – body: `{ email, password, name?, phone?, carNumber? }` → `{ user, token }`
- `POST /auth/login` – body: `{ email, password }` → `{ user, token }`

### Users (header: `Authorization: Bearer <token>`)

- `GET /users/me` – current profile → `{ name, email, phone, carNumber, avatar }`
- `PATCH /users/me` – body: `{ name?, email?, phone?, carNumber?, avatar? }` → updated profile

### Parking (public)

- `GET /parking/spots` – list parking spots (same shape as front-end `ParkingSpot`)
- `GET /parking/spots/:id` – one spot by id

### Bookings (header: `Authorization: Bearer <token>`)

- `GET /bookings` – list current user’s bookings; query `?status=active|completed|reserved`
- `GET /bookings/:id` – one booking
- `POST /bookings` – body: `{ parkingSpotId, date?, startTime?, endTime?, duration?, durationMinutes?, price }` → created booking
- `PATCH /bookings/:id` – body: `{ status: 'active'|'completed'|'reserved' }` → updated booking (e.g. start/end parking)

## Front-end integration

Point the Next.js app at `http://localhost:4000/api` (e.g. via `NEXT_PUBLIC_API_URL`). Replace `lib/mock-data.ts` usage with `fetch`/`useSWR`/React Query to these endpoints; auth screens can call `/auth/login` and `/auth/register` and store the returned `token` for `Authorization` on `/users/me`, `/bookings`, etc.
