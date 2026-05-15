# xHire PostgreSQL + Prisma Architecture Guide

This document describes the refactored xHire platform that uses **PostgreSQL (Supabase)** instead of MongoDB, with **Prisma ORM**, **Claude AI**, and **Deepgram STT** integration.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser/Client                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ React Components + Clerk Auth                    │   │
│  │ Audio Capture + Deepgram WebSocket              │   │
│  │ face-api.js (CV-based proctoring)               │   │
│  │ Stream.io Video SDK                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
            ↓ HTTP/WebSocket ↑
┌─────────────────────────────────────────────────────────┐
│              Node.js/Express API Layer                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ /api/interview/* - Interview management         │   │
│  │ /api/user/* - User & recruiter dashboard        │   │
│  │ /api/resume/* - Resume upload & parsing         │   │
│  │ Clerk auth middleware (JWT validation)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
            ↓ Prisma Client ↑
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL + pgvector (Supabase)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Users, Sessions, Messages (interviews)          │   │
│  │ Resumes + Embeddings (RAG for Claude)           │   │
│  │ Evaluations (scores, feedback)                  │   │
│  │ Proctoring Events (warnings, violations)        │   │
│  │ Job Queue (async evaluation tasks)              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
            ↓ External APIs ↑
┌──────────────┬──────────────┬──────────────┬────────────┐
│  Claude API  │ Deepgram API │ Stream.io    │ Supabase   │
│  (RAG Q&A)   │ (STT)        │ (Video)      │ (Storage)  │
└──────────────┴──────────────┴──────────────┴────────────┘
```

## Database Schema

### Core Tables

**Users**
- id, clerkId, email, name, role (CANDIDATE|RECRUITER|ADMIN)
- timestamps

**Sessions** (Interviews)
- id, candidateId, recruiterId, type (MOCK|PROCTORED), status (PENDING|ACTIVE|COMPLETED|TERMINATED)
- resumeId, jdId, warningCount
- startedAt, endedAt, createdAt, updatedAt

**Messages** (Interview Transcript)
- id, sessionId, role (AI|CANDIDATE), content, transcriptConf, audioDuration
- createdAt

**Resumes**
- id, userId, filename, extractedText, skills[]
- createdAt, updatedAt

**ResumeChunks** (RAG Embeddings)
- id, resumeId, content, embedding (pgvector 1536-dim)
- createdAt

**Evaluations**
- id, sessionId, technicalScore, communicationScore, confidenceScore, behavioralScore
- strengths[], weaknesses[], improvements[], detailedFeedback
- createdAt, updatedAt

**ProctorEvents**
- id, sessionId, eventType, severity (WARNING|SEVERE), warningNum
- createdAt

**Jobs** (Async Task Queue)
- id, type (evaluate|generate_report), status (PENDING|PROCESSING|COMPLETED|FAILED)
- payload, result, error, attempts, maxRetries
- createdAt, updatedAt

## Setup Instructions

### 1. Prerequisites

```bash
# Install Node.js 18+
node --version

# Clone the repository
cd xhire/backend
```

### 2. Install Dependencies

```bash
npm install
# This will install:
# - @prisma/client (ORM)
# - @anthropic-ai/sdk (Claude API)
# - @supabase/supabase-js (Storage)
# - All other dependencies from package.json
```

### 3. Setup Supabase PostgreSQL

**Create Supabase Project:**
1. Go to https://supabase.com
2. Create a new project
3. Wait for database to provision (5-10 min)
4. Go to Project Settings > Database
5. Copy the **Connection String** (NOT the psql connection, the PostgreSQL URI)

**Enable pgvector Extension:**
1. Go to SQL Editor in Supabase dashboard
2. Run this query:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Create .env file:**
```bash
cp ../.env.example ../.env

# Edit .env with these values:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?pgbouncer=true&schema=public
ANTHROPIC_API_KEY=sk-ant-...  # from Anthropic console
DEEPGRAM_API_KEY=...          # from Deepgram console
SUPABASE_URL=https://...
SUPABASE_KEY=eyJ...           # anon public key
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
STREAM_API_KEY=...
STREAM_API_SECRET=...
CLIENT_URL=http://localhost:3000
PORT=4000
```

### 4. Initialize Prisma & Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:push

# Seed with test data
npm run prisma:seed
```

### 5. Start the Server

```bash
npm run dev
# Server runs on http://localhost:4000
```

## API Endpoints

### Interview Management

**Create Interview**
```bash
POST /api/interview
Headers: Authorization: Bearer <token>
Body: {
  "type": "MOCK",
  "resumeText": "...",
  "jdText": "..."
}
Response: { sessionId, resumeId, jdId }
```

**Start Interview**
```bash
POST /api/interview/:id/start
Response: { questions: [...] }
```

**Submit Answer**
```bash
POST /api/interview/:id/answer
Body: { question, answer }
Response: { evaluation, nextQuestion }
```

**Log Proctoring Event**
```bash
POST /api/interview/:id/proctor/event
Body: { eventType, severity }
Response: { warningCount, terminated }
# Auto-rejects interview on 3 warnings
```

**Complete Interview**
```bash
POST /api/interview/:id/complete
Response: { evaluationJobId }
# Triggers async evaluation job
```

**Get Interview Details**
```bash
GET /api/interview/:id
Response: { messages, evaluation, proctorEvents, ... }
```

### User Management

**Get Current User**
```bash
GET /api/user/v2/me
Response: { id, email, name, role, resumes, jobDescriptions, ... }
```

**Update Profile**
```bash
PUT /api/user/v2/me
Body: { name, role }
```

**Get Candidate Directory** (Recruiter)
```bash
GET /api/user/v2/directory
Response: [{ id, email, name, resumes, sessions, ... }]
```

**Recruiter Dashboard**
```bash
GET /api/user/v2/recruiter/dashboard
Response: {
  stats: { totalSessions, completedSessions, avgScores, ... },
  recentSessions: [...]
}
```

## Key Features

### 1. AI-Powered Questions (Claude)
- Resume + JD context sent to Claude
- Generates 3 progressively harder questions
- RAG: Resume chunks retrieved based on relevance
- Follow-up questions auto-generated based on answers

### 2. Real-Time Transcription (Deepgram)
- Browser WebSocket connection to Deepgram
- API key exposed to browser (public key, not secret)
- Transcriptions saved as Messages in database
- Confidence scores tracked

### 3. Proctoring + CV Detection (face-api.js)
- Browser-side face detection using face-api.js
- No face = warning
- Multiple faces = warning
- Gaze off-screen = warning
- 3 warnings = auto-reject interview
- Events logged in ProctorEvents table

### 4. Video Streaming (Stream.io)
- Stream.io SDK for proctored interviews
- Persistent video history (optional)
- Screen sharing (optional)

### 5. Async Job Queue
- PostgreSQL-backed queue (no external service)
- Evaluation generation runs asynchronously
- Cron job every 30 seconds processes pending jobs
- Retry logic with exponential backoff

### 6. Resume RAG
- ResumChunks table stores text chunks + embeddings
- Claude embeddings API called on upload
- Vector similarity search retrieves relevant chunks
- Used for context in question generation

## Development Workflow

### Running the Server

```bash
# Development mode (auto-restart on file changes)
npm run dev

# Production mode
npm run start
```

### Database Management

```bash
# View database in GUI
npm run prisma:studio

# Create migration after schema change
npm run prisma:migrate

# Push schema directly to DB (for dev)
npm run prisma:push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Testing

```bash
# Check for Prisma errors
npm run prisma:generate

# Test API endpoints
curl http://localhost:4000/health

# View logs
cat logs/combined.log
```

## Migration from MongoDB

### What Changed

| Aspect | MongoDB | PostgreSQL |
|--------|---------|-----------|
| ORM | Mongoose | Prisma |
| Queries | Async/await with callbacks | Prisma Client |
| Embedding Search | Not native | pgvector |
| Job Queue | Inngest | Custom PostgreSQL |
| Schema Validation | Mongoose Schema | Prisma Schema |
| Transactions | Session-based | Native SQL transactions |

### How to Migrate Existing Data

```bash
# 1. Export from MongoDB
mongodump --uri="mongodb://..." --out=./backup

# 2. Write migration script to convert BSON to Prisma format

# 3. Run Prisma seed script
npm run prisma:seed

# 4. Validate data in Prisma Studio
npm run prisma:studio
```

## Security Considerations

### Row-Level Security (RLS)

Enable Supabase RLS policies:

```sql
-- Users can only see their own data
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their sessions"
  ON "Session"
  FOR SELECT
  USING (auth.uid()::text = "candidateId" OR auth.uid()::text = "recruiterId");
```

### API Authentication

- All `/api` routes require Clerk JWT
- JWT validated by `protectRoute` middleware
- User ID extracted from JWT and verified

### Secrets Management

- Never commit `.env` to git
- Use `.env.example` for reference
- Rotate API keys regularly
- Use Supabase project-specific keys only

## Deployment

### Deploy to Production

```bash
# Build
npm run build

# Push migrations
npm run prisma:push

# Start server
npm start
```

### Environment Variables

Set these in your hosting platform (Vercel, Railway, etc.):
- DATABASE_URL (Supabase connection string)
- CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY
- ANTHROPIC_API_KEY
- DEEPGRAM_API_KEY
- SUPABASE_URL / SUPABASE_KEY
- STREAM_API_KEY / STREAM_API_SECRET
- NODE_ENV=production

## Troubleshooting

### Database Connection Fails

```bash
# Check connection string in .env
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin < <<< "SELECT 1"

# Verify Supabase is accessible
ping <supabase-host>
```

### Prisma Migration Conflicts

```bash
# Reset and re-seed (dev only)
npx prisma migrate reset

# View pending migrations
npx prisma migrate status
```

### AI/Claude Errors

```bash
# Test Claude API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  ...

# Check for rate limits in logs
```

## Next Steps

1. Setup Supabase PostgreSQL
2. Configure .env variables
3. Run `npm install && npm run prisma:push`
4. Start server with `npm run dev`
5. Test endpoints with provided curl examples
6. Connect frontend to new API routes

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Claude API Reference](https://docs.anthropic.com)
- [Deepgram STT](https://developers.deepgram.com)
- [Stream.io Video](https://getstream.io/video/docs)
- [Clerk Auth](https://clerk.com/docs)
