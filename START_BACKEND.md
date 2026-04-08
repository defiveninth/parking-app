# 🚀 Quick Start: Backend Server

## The Issue
You're seeing a 404 error on `http://localhost:4000/api/support/tickets` because the backend API server is not running.

## Solution

### Start the Backend Server

Open a **new terminal** in v0 and run:

```bash
npm run server
```

This will start the Express API server on **port 4000**.

### Verify It's Running

You should see output like:
```
Parking API running at http://localhost:4000
```

Test it with:
```bash
curl http://localhost:4000/api/health
```

Expected response: `{"ok":true}`

## What's Running

- **Frontend (Next.js)**: Port 3000 ✅ Already running
- **Backend (Express)**: Port 4000 ⚠️ Needs to be started manually

## Both Servers Together (Optional)

If you install `concurrently`, you can run both with one command:

```bash
npm install --save-dev concurrently
npm run dev:all
```

## Troubleshooting

### Port 4000 already in use
```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9
```

### Database tables missing
```bash
cd server
node scripts/add-support-tables.js
```

### Backend dependencies not installed
```bash
cd server
npm install
```
