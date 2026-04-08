# Backend Server Setup

The parking app has two parts that need to run:
1. **Next.js Frontend** (port 3000) - Already running
2. **Express Backend API** (port 4000) - Needs to be started

## Quick Start

### Option 1: Run Backend Server Separately (Recommended for v0)

Open a new terminal and run:

```bash
cd server
npm install
npm run dev
```

The backend server will start on http://localhost:4000

### Option 2: Install Concurrently (Run Both Together)

If you want to run both frontend and backend together:

```bash
npm install --save-dev concurrently
npm run dev:all
```

## Verify Backend is Running

Test the backend health endpoint:

```bash
curl http://localhost:4000/api/health
```

You should see: `{"ok":true}`

## Database Setup

The database tables are automatically created when the server starts. 

To manually run the support tables migration:

```bash
cd server
node scripts/add-support-tables.js
```

## Troubleshooting

### Backend Server Not Running
- Make sure you're in the `server` directory
- Run `npm install` to install dependencies
- Check that port 4000 is not already in use

### 404 Errors on API Calls
- Verify backend server is running on port 4000
- Check console logs for any errors
- Make sure database tables are created

### Support Tickets Not Working
- Ensure the migration script was run: `node scripts/add-support-tables.js`
- Check that `support_tickets` and `support_messages` tables exist in the database
