# xHire - Project Improvements & Setup Guide

## Recent Improvements Made ✅

### 1. **Environment Variable Validation**
- Added validation checking for required environment variables at startup
- Displays clear warnings for missing configuration
- **File**: `backend/src/lib/env.js`

### 2. **Global Error Handling Middleware**
- Centralized error handler catches all route errors
- Proper HTTP status codes and error messages
- Development/Production error logging
- **File**: `backend/src/middleware/errorHandler.js`

### 3. **Request Logging & Security**
- Request/Response logging middleware for debugging
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **File**: `backend/src/middleware/logger.js`

### 4. **Input Validation Middleware**
- Reusable validation utilities for request body/query params
- Type checking, string/number validation, custom validators
- **File**: `backend/src/middleware/validator.js`

### 5. **Enhanced .env Setup**
- Detailed `.env.example` files with comments and descriptions
- Frontend `.env.local` properly excluded from git
- Clear API URL configuration

### 6. **Server Configuration Updates**
- Integrated all new middleware into server startup
- Better startup logging and error handling
- **File**: `backend/src/server.js`

---

## Development Setup

### 1. Install Dependencies
```bash
npm run install-deps
```

### 2. Configure Environment Variables

**Backend Setup**
```bash
# Copy template
cp backend/.env.example backend/.env

# Edit and fill in your values
# Required: CLERK_SECRET_KEY, STREAM_API_KEY, STREAM_API_SECRET, etc.
nano backend/.env
```

**Frontend Setup**
```bash
# Copy template
cp frontend/.env.example frontend/.env.local

# Edit and fill in your values
nano frontend/.env.local
```

### 3. Start Services
```bash
# Terminal 1: Backend
npm run dev --prefix backend

# Terminal 2: Frontend
npm run dev --prefix frontend
```

---

## Key Configuration Services

### Clerk (Authentication)
- **Dashboard**: https://dashboard.clerk.com
- **Getting Keys**:
  1. Create application in Clerk
  2. Copy Publishable & Secret Keys
  3. Add to `.env` files

### Stream.io (Video & Chat)
- **Dashboard**: https://getstream.io/dashboard
- **Getting Keys**:
  1. Create Stream app
  2. Copy API Key & Secret
  3. Add to `.env` files

### MongoDB Atlas
- **Site**: https://www.mongodb.com/cloud/atlas
- **Connection String Format**: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

### Inngest (Async Jobs)
- **Dashboard**: https://app.inngest.com
- Used for background tasks and event processing

---

## API Endpoints Health Check

```bash
# Check backend health
curl http://localhost:4000/health

# Response:
# {"msg":"api is up and running"}
```

---

## Error Handling

### Backend Error Response Format
```json
{
  "error": {
    "message": "User-friendly error message",
    "status": 400,
    "stack": "... (development only)"
  }
}
```

### Common Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Using Validation Middleware

Example of adding validation to a route:

```javascript
import { validateInput } from "../middleware/validator.js";

const createRoomSchema = {
  title: { type: "string", required: true, minLength: 3, maxLength: 100 },
  description: { type: "string", maxLength: 500 },
  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
};

router.post("/", validateInput(createRoomSchema), createRoomHandler);
```

---

## Security Best Practices

✅ **Always implemented**:
- CORS protection
- Clerk authentication middleware
- Security headers (no MIME type sniffing, XSS protection)
- Bearer token validation
- Request logging for audit trails

✅ **Development tips**:
- Check `/health` endpoint for quick server status
- Monitor request logs for debugging
- Validate all user input before database operations

---

## Troubleshooting

### Backend won't start
```
Check:
1. PORT 4000 is available
2. All required env vars are set
3. Node.js 18+ is installed
```

### MongoDB connection fails
```
Check:
1. MONGODB_URI is correct
2. IP whitelist includes your IP
3. Database user has correct permissions
```

### Frontend can't reach backend
```
Check:
1. Backend is running on port 4000
2. VITE_API_URL = http://localhost:4000
3. CORS is enabled for your origin
```

### Clerk tokens not working
```
Check:
1. CLERK_PUBLISHABLE_KEY matches in frontend
2. CLERK_SECRET_KEY is set in backend
3. Frontend setClerkToken() is called in App.jsx
```

---

## Next Steps

- [ ] Set up CI/CD pipeline
- [ ] Add rate limiting middleware
- [ ] Implement API versioning
- [ ] Add request compression
- [ ] Set up monitoring/alerting
- [ ] Add request caching strategy
- [ ] Implement database indexing optimization

---

## File Structure Reference

```
backend/
├── src/
│   ├── middleware/
│   │   ├── errorHandler.js      ← Global error handling
│   │   ├── logger.js            ← Request logging & security
│   │   ├── protectRoute.js      ← Authentication
│   │   └── validator.js         ← Input validation
│   ├── lib/
│   │   └── env.js               ← Env vars with validation
│   ├── controllers/             ← Business logic
│   ├── models/                  ← MongoDB schemas
│   ├── routes/                  ← API endpoints
│   └── server.js                ← Express app setup

frontend/
├── src/
│   ├── lib/
│   │   ├── axios.js             ← API client with error handling
│   │   └── utils.js
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── api/
├── .env.example
└── .env.local                   ← Local config (git ignored)
```

---

**Last Updated**: May 13, 2026
**Status**: ✅ Ready for Development
