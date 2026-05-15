# Quick Start Guide - xHire with PostgreSQL/Supabase

This is a quick reference guide to get the xHire platform up and running with the new Prisma + PostgreSQL architecture.

## 30-Minute Setup

### 1. Create Supabase Project (5 min)
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `xhire` (or your choice)
   - Database Password: Generate a strong one
   - Region: Pick closest to you
4. Wait for provisioning...

### 2. Get Connection String (2 min)
1. In Supabase dashboard → Project Settings → Database
2. Under "Connection string", select "URI"
3. Copy the PostgreSQL URI (starts with `postgresql://`)
4. It should look like:
   ```
   postgresql://postgres:password@host:5432/postgres?pgbouncer=true&schema=public
   ```

### 3. Enable pgvector (1 min)
1. Go to SQL Editor in Supabase
2. New Query
3. Paste and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 4. Setup Environment Variables (3 min)
Create `.env` in project root:
```bash
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?pgbouncer=true&schema=public

# Clerk (keep existing values if you have them)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Claude API - Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Deepgram - Get from https://console.deepgram.com/
DEEPGRAM_API_KEY=...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJ...

# Stream.io (keep existing if you have it)
STREAM_API_KEY=...
STREAM_API_SECRET=...

# Server Config
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 5. Install Dependencies & Setup Database (5 min)
```bash
# Go to backend
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:push

# Seed with test data
npm run prisma:seed
```

### 6. Start Backend (2 min)
```bash
npm run dev
# Server should print:
# ✅ PostgreSQL (Prisma) connected successfully
# ✅ Server started on port: 4000
```

### 7. Test Backend
```bash
# In another terminal
curl http://localhost:4000/health
# Should return: { "msg": "api is up and running" }
```

## Quick API Tests

### Test Interview Creation
```bash
CLERK_TOKEN="your_clerk_auth_token_here"

curl -X POST http://localhost:4000/api/interview \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MOCK",
    "resumeText": "Senior Engineer with 5 years Node.js experience",
    "jdText": "Looking for Full Stack Engineer with Node.js and React"
  }'
```

Expected response:
```json
{
  "success": true,
  "sessionId": "clx...",
  "resumeId": "clx...",
  "jdId": "clx..."
}
```

### Test Getting User Profile
```bash
curl -X GET http://localhost:4000/api/user/v2/me \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

### Test Recruiter Dashboard
```bash
curl -X GET http://localhost:4000/api/user/v2/recruiter/dashboard \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

## Frontend Integration

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Update Frontend .env
```
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Start Frontend
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

## Project Structure

```
xhire/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.js                # Seed test data
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.js          # Prisma client
│   │   │   ├── claude.js          # Claude AI integration
│   │   │   ├── deepgram.js        # Deepgram STT
│   │   │   ├── jobQueue.js        # Job queue for async tasks
│   │   │   └── supabase.js        # Storage service
│   │   ├── controllers/
│   │   │   ├── interviewControllerV2.js
│   │   │   ├── userControllerV2.js
│   │   │   └── jobControllerV2.js
│   │   ├── routes/
│   │   │   ├── interviewRoutesV2.js
│   │   │   ├── userRoutesV2.js
│   │   │   └── jobRoutesV2.js
│   │   ├── server.js              # Express app
│   │   └── middleware/            # Auth, error handling
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── interviewsV2.js    # Interview API client
│   │   │   └── usersV2.js         # User API client
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   └── App.jsx
│   ├── package.json
│   └── .env.local
├── POSTGRES_SETUP.md              # Detailed setup guide
├── INTEGRATION_GUIDE.md           # Frontend/Backend integration
└── .env.example                   # Environment variables template
```

## Database Models

### Core Tables
- **Users**: Candidates, recruiters, admins
- **Sessions**: Interview sessions (mock or proctored)
- **Messages**: Interview transcript
- **Resumes**: Resume uploads + parsed data
- **ResumeChunks**: Embeddings for RAG
- **Evaluations**: Interview scores and feedback
- **ProctorEvents**: Proctoring violations
- **Jobs**: Async task queue

## Key Features Included

✅ Claude AI question generation  
✅ Claude AI answer evaluation  
✅ Deepgram real-time transcription  
✅ face-api.js proctoring  
✅ PostgreSQL with Prisma ORM  
✅ Async job queue  
✅ Supabase storage integration  
✅ Recruiter dashboard  
✅ Comprehensive evaluation reports  

## Troubleshooting

### "DATABASE_URL not found"
- Check `.env` file exists in project root
- Verify DATABASE_URL is set correctly
- Test connection: `psql $DATABASE_URL`

### "Cannot find module @prisma/client"
- Run: `npm run prisma:generate`
- Then restart server

### "pgvector extension not found"
- Log into Supabase SQL Editor
- Run: `CREATE EXTENSION IF NOT EXISTS vector;`

### "Clerk authentication fails"
- Get new tokens from Clerk dashboard
- Update CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
- Restart server

### "Claude API key error"
- Get key from: https://console.anthropic.com/
- Update ANTHROPIC_API_KEY
- Restart server

## Next Steps

1. ✅ Backend setup complete
2. ✅ Database configured
3. ✅ API routes ready
4. → Connect frontend to new endpoints
5. → Implement UI components
6. → Test complete interview flow
7. → Deploy to production

## Production Deployment

### Deploy Backend
```bash
# Option 1: Vercel
npm i -g vercel
vercel

# Option 2: Railway
npm i -g railway
railway login
railway link
railway up

# Option 3: Render
# Push to GitHub and connect Render
```

### Deploy Database
- Supabase projects are already hosted (no action needed)
- Just ensure DATABASE_URL is set in production environment

### Deploy Frontend
```bash
# Vercel
npm run build
vercel --prod

# Or use GitHub integration for auto-deploy
```

## Monitoring

### Check Backend Health
```bash
curl http://your-backend-url.com/health
```

### View Database Logs
```bash
# Supabase dashboard → Database → Logs
```

### Check Job Queue Status
```bash
npm run prisma:studio
# Then navigate to Jobs table
```

## Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Claude API**: https://docs.anthropic.com
- **Deepgram**: https://developers.deepgram.com
- **Stream.io**: https://getstream.io/video/docs

## What's Different from MongoDB Version?

| Feature | MongoDB | PostgreSQL |
|---------|---------|-----------|
| Database | Mongoose ODM | Prisma ORM |
| Vector Search | Not native | pgvector extension |
| Job Queue | Inngest | PostgreSQL-backed |
| Type Safety | Limited | Full (generated types) |
| Transactions | Limited | Full ACID support |
| Query Performance | Document-based | Row-based indexes |

The new PostgreSQL version is more suitable for:
- AI/ML embeddings (pgvector)
- Complex reporting queries
- Real-time evaluation processing
- Multi-tenant data isolation with RLS
