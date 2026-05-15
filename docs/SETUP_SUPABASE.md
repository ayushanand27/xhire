# Setup: Supabase PostgreSQL Database

This guide walks you through setting up PostgreSQL with Supabase and pgvector for xHire.

## Why Supabase?

- PostgreSQL database hosted (no server setup)
- pgvector extension for AI embeddings
- Supabase Storage for file uploads (resumes, reports)
- Row-Level Security (RLS) for multi-tenant data isolation
- Real-time subscriptions (optional)
- Easy to migrate later

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `xhire` (or your choice)
   - **Database Password**: Generate a strong one (save it!)
   - **Region**: Pick closest to your users
4. Click **Create new project**
5. Wait 5-10 minutes for database to provision

---

## Step 2: Get Connection String

1. In Supabase dashboard → **Project Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the PostgreSQL URI (starts with `postgresql://`)

Example format:
```
postgresql://postgres:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**Important**: Use this connection string as your `DATABASE_URL`

---

## Step 3: Enable pgvector Extension

1. Go to **SQL Editor** in Supabase
2. Click **"New Query"**
3. Paste this SQL:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
4. Click **"Run"**
5. Confirm: Extension created ✅

---

## Step 4: Add to Backend .env

In `backend/.env`:
```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?pgbouncer=true&schema=public
```

Replace:
- `YOUR_PASSWORD` — The password you created
- `YOUR_HOST` — The host from Supabase (e.g., `aws-0-us-east-1.pooler.supabase.com`)

---

## Step 5: Test Connection

```bash
# From backend directory
npm run prisma:generate

# Test connection
npm run prisma:push
```

If successful, you'll see:
```
✅ Prisma schema pushed to database
```

---

## Step 6: Seed Test Data

```bash
npm run prisma:seed
```

Output:
```
🌱 Seeding database...
✅ Users created
✅ Resume created
✅ Job Description created
✨ Database seeding complete!
```

---

## Verify Setup

Open Prisma Studio:
```bash
npm run prisma:studio
```

Navigate to `http://localhost:5555` and verify:
- ✅ Users table has test data
- ✅ Resumes table has entries
- ✅ JobDescriptions table populated

---

## Troubleshooting

### Error: "PGBOUNCER" or connection timeout
- Check `DATABASE_URL` includes `?pgbouncer=true`
- Verify database password is correct
- Check Supabase dashboard → Project Status (should be green)

### Error: "permission denied for schema public"
- Make sure you're logged in as `postgres` user (default)
- Check database is fully provisioned (5-10 min wait)

### Error: "pgvector not found"
- Run SQL query again to enable extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

### Port connection refused
- Supabase uses port 6543 for pooler (not 5432)
- Connection string should include `pooler.supabase.com`

---

## Next: Setup Claude API

Once database is ready, follow [SETUP_CLAUDE.md](SETUP_CLAUDE.md)

---

## Supabase Dashboard Quick Links

- **Project Settings**: https://supabase.com/dashboard/project/_/settings/general
- **Database**: https://supabase.com/dashboard/project/_/settings/database
- **SQL Editor**: https://supabase.com/dashboard/project/_/sql
- **Table Editor**: https://supabase.com/dashboard/project/_/editor

(Replace `_` with your project ID)

---

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Prisma Docs](https://www.prisma.io/docs)
