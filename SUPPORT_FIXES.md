# Support System Fixes ✅

## Issues Fixed

### 1. ✅ 404 Error - Backend Server Not Running
**Problem**: `POST http://localhost:4000/api/support/tickets` returned 404  
**Cause**: The Express backend server wasn't running (only Next.js frontend was active)  
**Fix**: 
- Added `npm run server` script to start the backend
- Created startup documentation in `START_BACKEND.md`
- Backend must be started manually with `npm run server`

### 2. ✅ Missing Authentication Tokens
**Problem**: Support API calls weren't including authentication tokens  
**Cause**: API functions didn't accept or pass the `authToken` parameter  
**Fix**: Updated all support API functions in `/lib/api.ts`:
- `getSupportTicketsApi(token)` - now requires token
- `getSupportTicketApi(token, id)` - now requires token  
- `createSupportTicketApi(token, data)` - now requires token
- `addSupportMessageApi(token, ticketId, message)` - now requires token
- `closeSupportTicketApi(token, ticketId)` - now requires token

### 3. ✅ Support Page Not Using Authentication
**Problem**: Support page components didn't use auth context  
**Cause**: Missing `useApp()` hook to get the user's token  
**Fix**: Updated `/app/support/page.tsx`:
- Added `useApp()` hook import
- Passed token to all API calls
- Added token checks before making requests

### 4. ✅ Database Tables
**Problem**: Support tables might not exist  
**Fix**: 
- Migration script created: `server/scripts/add-support-tables.js`
- Can be run with: `cd server && node scripts/add-support-tables.js`

## How to Start the Application

### Step 1: Start the Backend API (Required!)
```bash
npm run server
```

This starts the Express server on port 4000. You should see:
```
Parking API running at http://localhost:4000
```

### Step 2: Verify Backend is Running
```bash
curl http://localhost:4000/api/health
```

Expected: `{"ok":true}`

### Step 3: Use the App
The Next.js frontend (port 3000) is already running. Now that the backend is active:
1. Navigate to Settings → Support
2. Create a new ticket
3. Chat with admin (via admin panel)

## File Changes Summary

### Modified Files
- ✏️ `/lib/api.ts` - Added token parameter to all support API functions
- ✏️ `/app/support/page.tsx` - Added authentication using `useApp()` hook
- ✏️ `/package.json` - Added `server` and `dev:all` scripts
- ✏️ `/components/screens/settings-screen.tsx` - Added Support menu item

### New Files
- ✨ `/server/src/routes/support.js` - Support ticket API routes
- ✨ `/server/scripts/add-support-tables.js` - Database migration
- ✨ `/components/admin/support-tab.tsx` - Admin support interface
- ✨ `/START_BACKEND.md` - Quick start guide
- ✨ `/SERVER_SETUP.md` - Detailed setup instructions

## Testing Checklist

- [ ] Backend server starts successfully
- [ ] Health endpoint returns `{"ok":true}`
- [ ] User can create a support ticket
- [ ] User can view their tickets
- [ ] User can send messages
- [ ] Admin can view all tickets
- [ ] Admin can reply to tickets
- [ ] Admin can change ticket status/priority

## Common Errors & Solutions

### "Failed to fetch" or Network Error
→ Backend server not running. Run `npm run server`

### 401 Unauthorized
→ User not logged in. Login first before accessing support

### "Ticket not found"
→ User trying to access another user's ticket. Users can only see their own tickets.

### Database errors about missing tables
→ Run migration: `cd server && node scripts/add-support-tables.js`
