# Parking Application Backend API

This is the Express-based API server for the Parking Application. It manages user authentication, parking slot queries, booking reservations, gate barrier entry/exit simulation, customer support tickets, and administrator actions.

## Architecture and Tech Stack

The backend is built as a lightweight, performant RESTful API server:

- Runtime: Node.js (configured as ES Modules)
- Framework: Express.js
- Database: SQLite (via better-sqlite3 for synchronous local operations)
- Authentication: JSON Web Tokens (JWT)
- Password Hashing: bcryptjs

## Directory Structure

The server folder is organized as follows:

- data/ - Contains local SQLite database files (e.g., parking_app.sqlite).
- scripts/ - Database utility and migration scripts.
  - init-db.js - Standalone database initialization script.
  - add-support-tables.js - Migration script that manually builds support-related schemas.
- sql/ - raw SQL files used for initial schema structure.
  - schema.sql - Contains structural definitions for users, parking_spots, and bookings.
  - add_support.sql - Contains definitions for support_tickets and support_messages.
- src/ - API implementation codebase.
  - index.js - Server entrypoint that initializes Express, mounts routes, and registers middleware.
  - db.js - SQLite connection manager, automatic migration runner, and query wrapper.
  - middleware/ - Security, authentication, and authorization layers.
    - auth.js - JWT token parser and validator.
    - admin.js - Header private-key validator for backend administrators.
  - routes/ - Modular routers dividing endpoints by domain model.
    - auth.js - Sign up and sign in endpoints.
    - users.js - Current profile and balance configuration.
    - parking.js - Spot list and real-time space updater.
    - bookings.js - Booking lifecycle, barrier controller simulation.
    - support.js - Customer support tickets and communications.
    - admin.js - Admin panel controllers, user and spot CRUD, and database analytics.

## Environment Configuration

To configure the application, create a .env file in the server directory. The variables are:

- PORT: The port number the server will listen on. Default: 4000
- JWT_SECRET: Secret signature phrase used to sign and verify JSON Web Tokens.
- SQLITE_PATH: Relative or absolute path to the local database file. Default: data/parking_app.sqlite
- ADMIN_PRIVATE_KEY: Hexadecimal or string credential required to access administrative APIs.

Example environment file:
```
PORT=4000
JWT_SECRET=change-me-to-a-random-secret
SQLITE_PATH=./data/parking_app.sqlite
ADMIN_PRIVATE_KEY=0x4c0883a69102937d6231471b5dbb6204fe512961708279e8e9e7a0e9b0fbbd
```

## Database Architecture

The backend database contains the following tables:

### 1. users
Stores details of motorists using the application.
- id: INTEGER, Primary Key, Autoincrement
- email: TEXT, Unique, Not Null
- password_hash: TEXT, Not Null
- name: TEXT, Not Null
- phone: TEXT, Nullable
- car_number: TEXT, Nullable
- avatar: TEXT, Nullable (Generated automatically from name initials if omitted)
- balance: INTEGER, Default: 0 (Stores current wallet currency amount)
- created_at: TEXT, Default: Current timestamp
- updated_at: TEXT, Default: Current timestamp

### 2. parking_spots
Represents physical parking garages or lots.
- id: INTEGER, Primary Key, Autoincrement
- name: TEXT, Not Null
- address: TEXT, Not Null
- distance: TEXT, Nullable (e.g., "200m")
- available_spots: INTEGER, Not Null, Default: 0
- total_spots: INTEGER, Not Null, Default: 0
- price_per_hour: INTEGER, Not Null, Default: 0 (KZT)
- lat: REAL, Not Null (Latitude)
- lng: REAL, Not Null (Longitude)
- has_covered: INTEGER, Default: 0 (Boolean flag)
- has_charging: INTEGER, Default: 0 (Boolean flag)
- has_disabled: INTEGER, Default: 0 (Boolean flag)
- created_at: TEXT, Default: Current timestamp

### 3. bookings
Tracks the lifecycle of parking spot reservations and active parking events.
- id: INTEGER, Primary Key, Autoincrement
- user_id: INTEGER, Foreign Key references users(id) ON DELETE CASCADE
- parking_spot_id: INTEGER, Foreign Key references parking_spots(id) ON DELETE CASCADE
- date: TEXT, Not Null (e.g., "Today")
- start_time: TEXT, Not Null
- end_time: TEXT, Not Null
- duration: TEXT, Not Null (e.g., "1h 30m")
- duration_minutes: INTEGER, Not Null
- price: INTEGER, Not Null (Billing amount in KZT)
- status: TEXT, Check Constraint: ('active', 'completed', 'reserved')
- qr_code: TEXT, Not Null (Simulated identifier barcode string)
- booking_type: TEXT, Default: 'enter_now' (Options: 'enter_now', 'book_later')
- expires_at: TEXT, Nullable (Timestamp indicating when a reservation expires)
- entered_at: TEXT, Nullable (Timestamp recording when the vehicle crossed the barrier)
- created_at: TEXT, Default: Current timestamp

### 4. support_tickets
Represents user requests for support help.
- id: INTEGER, Primary Key, Autoincrement
- user_id: INTEGER, Foreign Key references users(id) ON DELETE CASCADE
- subject: TEXT, Not Null
- status: TEXT, Check Constraint: ('open', 'in_progress', 'closed'), Default: 'open'
- priority: TEXT, Check Constraint: ('low', 'medium', 'high', 'urgent'), Default: 'medium'
- created_at: TEXT, Default: Current timestamp
- updated_at: TEXT, Default: Current timestamp

### 5. support_messages
Contains historical back-and-forth messages inside a support ticket.
- id: INTEGER, Primary Key, Autoincrement
- ticket_id: INTEGER, Foreign Key references support_tickets(id) ON DELETE CASCADE
- user_id: INTEGER, Foreign Key references users(id) ON DELETE SET NULL
- is_admin: INTEGER, Default: 0 (Boolean flag)
- message: TEXT, Not Null
- created_at: TEXT, Default: Current timestamp

## Getting Started

### Prerequisites

Node.js (v18 or higher recommended) and npm or yarn installed locally.

### Installation

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

### Running the Server

#### Development Mode
Runs the server with Node's native watch feature for hot reloading:
```bash
npm run dev
```

#### Production Mode
Runs the server directly:
```bash
npm start
```

On success, you will see the output:
`Parking API running at http://localhost:4000`

## Utilities and Migrations

The database tables are automatically generated on first boot. If the database schema exists but support tables or columns are missing, they will be migrated automatically. You can also trigger initialization tasks manually:

- Seeding Default Parking Spots:
  Seeds 30 locations in Almaty with lat/lng coordinates and capabilities. Run automatically on first boot, or manually using:
  ```bash
  npm run db:init
  ```
- Creating Support Tables Migration:
  If running against a legacy database file without support tables, execute:
  ```bash
  node scripts/add-support-tables.js
  ```

## Middleware Documentation

### User Authentication (Bearer Token)
The `requireAuth` middleware validates users by parsing the HTTP header:
`Authorization: Bearer <JWT_TOKEN>`
- Valid token: Sets `req.user` with `{ userId, email }` and calls `next()`.
- Invalid or missing token: Responds with HTTP `401 Unauthorized` or `401 Invalid or expired token`.

The `optionalAuth` middleware works similarly but does not halt request progression or throw a 401 when the Authorization header is absent.

### Admin Authentication (Private Key Header)
The `requireAdmin` middleware secures sensitive analytics and management controllers:
`x-private-key: <ADMIN_PRIVATE_KEY>`
- Correct key: Calls `next()`.
- Missing key: Responds with HTTP `401 Missing private key`.
- Incorrect key: Responds with HTTP `403 Invalid private key`.

## API Endpoint Reference

### Authentication (Public)

#### Register User
`POST /api/auth/register`
Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Jane Doe",
  "phone": "+77071234567",
  "carNumber": "123ABC02"
}
```
Response (201 Created):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "phone": "+77071234567",
    "carNumber": "123ABC02",
    "avatar": "JD",
    "balance": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
`POST /api/auth/login`
Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
Response (200 OK):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "phone": "+77071234567",
    "carNumber": "123ABC02",
    "avatar": "JD",
    "balance": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Profile (Auth Required)

#### Retrieve Current Profile
`GET /api/users/me`
Response (200 OK):
```json
{
  "name": "Jane Doe",
  "email": "user@example.com",
  "phone": "+77071234567",
  "carNumber": "123ABC02",
  "avatar": "JD",
  "balance": 0
}
```

#### Update Profile Information
`PATCH /api/users/me`
Body:
```json
{
  "name": "Jane Smith",
  "phone": "+77079998877",
  "carNumber": "777XYZ02"
}
```
Response (200 OK):
```json
{
  "name": "Jane Smith",
  "email": "user@example.com",
  "phone": "+77079998877",
  "carNumber": "777XYZ02",
  "avatar": "JD",
  "balance": 0
}
```

#### Top Up Account Balance
`POST /api/users/me/topup`
Body:
```json
{
  "amount": 2500
}
```
Response (200 OK):
```json
{
  "name": "Jane Smith",
  "email": "user@example.com",
  "phone": "+77079998877",
  "carNumber": "777XYZ02",
  "avatar": "JD",
  "balance": 2500
}
```

### Parking Spots (Public)

#### List All Spots
`GET /api/parking/spots`
Response (200 OK):
```json
[
  {
    "id": "1",
    "name": "Dostyk Plaza Parking",
    "address": "Dostyk Ave 111, Almaty",
    "distance": "200m",
    "availableSpots": 80,
    "totalSpots": 80,
    "pricePerHour": 500,
    "lat": 43.238,
    "lng": 76.9458,
    "hasCovered": 1,
    "hasCharging": 1,
    "hasDisabled": 1
  }
]
```

#### Get Specific Parking Spot
`GET /api/parking/spots/:id`
Response (200 OK):
```json
{
  "id": "1",
  "name": "Dostyk Plaza Parking",
  "address": "Dostyk Ave 111, Almaty",
  "distance": "200m",
  "availableSpots": 80,
  "totalSpots": 80,
  "pricePerHour": 500,
  "lat": 43.238,
  "lng": 76.9458,
  "hasCovered": 1,
  "hasCharging": 1,
  "hasDisabled": 1
}
```

#### Update Spot Available Count via Camera Detection
Calculates the adjusted available space count based on the formula:
`available = total - detected cars - active reservations`
`POST /api/parking/spots/:id/update-count`
Body:
```json
{
  "carCount": 15
}
```
Response (200 OK):
```json
{
  "success": true,
  "carCount": 15,
  "reservedCount": 2,
  "availableSpots": 63,
  "totalSpots": 80
}
```

### Bookings (Auth Required)

#### List User's Bookings
`GET /api/bookings`
Query Parameters (Optional):
- `status`: Filter by `active`, `completed`, or `reserved`
Response (200 OK):
```json
[
  {
    "id": 12,
    "parkingSpotId": 1,
    "parkingName": "Dostyk Plaza Parking",
    "address": "Dostyk Ave 111, Almaty",
    "date": "Today",
    "startTime": "10:30 AM",
    "endTime": "12:00 PM",
    "duration": "1h 30m",
    "price": 0,
    "status": "reserved",
    "qrCode": "BK-5421-QR",
    "bookingType": "enter_now",
    "expiresAt": "2026-07-01T17:59:00.000Z",
    "enteredAt": null,
    "pricePerHour": 500
  }
]
```

#### Create Booking Reservation
Checks user balance (rejects if negative) and spots availability before reserving.
`POST /api/bookings`
Body:
```json
{
  "parkingSpotId": 1,
  "bookingType": "book_later",
  "price": 500,
  "date": "Today",
  "startTime": "04:00 PM",
  "endTime": "06:00 PM"
}
```
Response (201 Created):
```json
{
  "id": 13,
  "parkingSpotId": 1,
  "parkingName": "Dostyk Plaza Parking",
  "address": "Dostyk Ave 111, Almaty",
  "date": "Today",
  "startTime": "04:00 PM",
  "endTime": "06:00 PM",
  "duration": "2h",
  "price": 500,
  "status": "reserved",
  "qrCode": "BK-9831-QR",
  "bookingType": "book_later",
  "expiresAt": "2026-07-01T23:49:00.000Z",
  "enteredAt": null,
  "pricePerHour": 500
}
```

#### Open Entry Barrier
Simulates driving through the entrance gate. Transitions status from `reserved` to `active` and records the start time.
`POST /api/bookings/:id/open-barrier`
Response (200 OK):
```json
{
  "success": true,
  "message": "Barrier opened successfully"
}
```

#### Open Exit Barrier & Billing
Simulates exiting the parking lot. Calculates minutes spent, maps it to hourly cost, updates the booking to `completed`, decrements the user's wallet balance, and restores the parking spot's available capacity.
`POST /api/bookings/:id/exit-barrier`
Response (200 OK):
```json
{
  "success": true,
  "message": "Exit successful",
  "duration": "1h 12m",
  "durationMinutes": 72,
  "cost": 1000,
  "pricePerHour": 500,
  "billedHours": 2,
  "newBalance": 1500
}
```

### Support Tickets (Auth Required)

#### List Support Tickets
`GET /api/support/tickets`
Response (200 OK):
```json
[
  {
    "id": 5,
    "subject": "Billing issue on Dostyk Plaza",
    "status": "open",
    "priority": "high",
    "created_at": "2026-07-01T15:20:00.000Z",
    "updated_at": "2026-07-01T15:20:00.000Z",
    "message_count": 1,
    "last_message": "My card was charged twice."
  }
]
```

#### Get Ticket Conversation Details
`GET /api/support/tickets/:id`
Response (200 OK):
```json
{
  "id": 5,
  "user_id": 1,
  "subject": "Billing issue on Dostyk Plaza",
  "status": "open",
  "priority": "high",
  "created_at": "2026-07-01T15:20:00.000Z",
  "updated_at": "2026-07-01T15:20:00.000Z",
  "messages": [
    {
      "id": 10,
      "message": "My card was charged twice.",
      "is_admin": 0,
      "created_at": "2026-07-01T15:20:00.000Z",
      "sender_name": "Jane Smith"
    }
  ]
}
```

#### Create New Ticket
`POST /api/support/tickets`
Body:
```json
{
  "subject": "App crashes during topup",
  "message": "When I typed 5000 and clicked topup, the app froze.",
  "priority": "medium"
}
```
Response (201 Created):
```json
{
  "id": 6,
  "subject": "App crashes during topup",
  "status": "open",
  "priority": "medium",
  "created_at": "2026-07-01T17:49:00.000Z"
}
```

#### Add Message to Ticket
`POST /api/support/tickets/:id/messages`
Body:
```json
{
  "message": "Is there any update on this ticket?"
}
```
Response (201 Created):
```json
{
  "id": 11,
  "created_at": "2026-07-01T17:50:00.000Z"
}
```

#### Close Ticket
`PATCH /api/support/tickets/:id/close`
Response (200 OK):
```json
{
  "success": true
}
```

### Admin & Analytics (Admin Auth Header Required)

#### Verify Administrator Key
`POST /api/admin/verify`
Response (200 OK):
```json
{
  "valid": true
}
```

#### Fetch Dashboard Analytics and Statistics
Returns database overview metrics, booking stats, registration trends, revenue diagrams, and peak hours.
`GET /api/admin/statistics`
Response (200 OK):
```json
{
  "overview": {
    "totalUsers": 12,
    "totalParkingSpots": 30,
    "totalBookings": 150,
    "activeBookings": 3,
    "totalRevenue": 45000,
    "avgBookingDuration": 85
  },
  "bookingsByStatus": [
    { "status": "completed", "count": 135 },
    { "status": "reserved", "count": 12 },
    { "status": "active", "count": 3 }
  ],
  "revenueByDay": [
    { "date": "2026-06-25", "revenue": 6000, "bookings": 10 }
  ],
  "revenueByMonth": [
    { "month": "2026-06", "revenue": 45000, "bookings": 150 }
  ],
  "topParkingSpots": [
    { "id": 1, "name": "Dostyk Plaza Parking", "address": "Dostyk Ave 111", "bookingCount": 42, "totalRevenue": 21000 }
  ],
  "userRegistrationTrend": [
    { "date": "2026-06-25", "registrations": 2 }
  ],
  "bookingTypes": [
    { "type": "enter_now", "count": 110 },
    { "type": "book_later", "count": 40 }
  ],
  "peakHours": [
    { "hour": 14, "bookings": 25 }
  ]
}
```

#### User Administration CRUD
- `GET /api/admin/users` - List all registered users.
- `GET /api/admin/users/:id` - Details for a user.
- `POST /api/admin/users` - Create a user.
- `PATCH /api/admin/users/:id` - Edit user fields (email, password, name, phone, car number).
- `DELETE /api/admin/users/:id` - Deletes user accounts.

#### Parking Spot CRUD
- `GET /api/admin/parking` - Lists all parking locations.
- `GET /api/admin/parking/:id` - Get details of one spot.
- `POST /api/admin/parking` - Create a new location with coordinate configurations.
- `PATCH /api/admin/parking/:id` - Modify location specs, coordinate pins, or pricing.
- `DELETE /api/admin/parking/:id` - Deletes the location.

#### Admin Support Ticket Management
- `GET /api/admin/support/tickets` - List all system support tickets with user profiles.
- `GET /api/admin/support/tickets/:id` - View ticket conversation with details.
- `POST /api/admin/support/tickets/:id/messages` - Post administrator response to ticket.
- `PATCH /api/admin/support/tickets/:id/status` - Transition status (`open`, `in_progress`, `closed`).
- `PATCH /api/admin/support/tickets/:id/priority` - Adjust priority (`low`, `medium`, `high`, `urgent`).
