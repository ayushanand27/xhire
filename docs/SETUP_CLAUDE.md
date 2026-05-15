# Setup: Claude API (Anthropic)

This guide walks you through setting up Claude API for AI-powered interview questions and evaluation.

## Why Claude?

- Best-in-class reasoning for technical interview evaluation
- Fast API response times (< 1 second)
- Excellent for RAG (Retrieval-Augmented Generation)
- Parse resumes and job descriptions
- Generate follow-up questions based on answers
- Produce structured evaluation reports with scores

---

## Step 1: Create Anthropic Account

1. Go to https://console.anthropic.com/
2. Click **"Sign Up"** (or **"Sign In"** if you already have an account)
3. Create account with:
   - Email
   - Password
   - Accept terms
4. Verify email

---

## Step 2: Get API Key

1. In Anthropic console → **API Keys** (left sidebar)
2. Click **"Create Key"**
3. Give it a name: `xhire-backend`
4. Copy the API key (starts with `sk-ant-`)
5. **Save it securely** — you won't see it again!

---

## Step 3: Setup Billing

1. In Anthropic console → **Plans** (left sidebar)
2. Switch to **Pro** plan (if not already)
3. Add payment method
4. Set spending limit (optional but recommended)

**Note**: Claude API is metered. Rough costs:
- 1 interview = ~$0.10 (3 questions + 3 evaluations)
- 100 interviews = ~$10

---

## Step 4: Add to Backend .env

In `backend/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

Replace `YOUR_KEY_HERE` with your actual API key.

---

## Step 5: Test Connection

```bash
# From backend directory
npm run dev
```

Start an interview via API:
```bash
curl -X POST http://localhost:4000/api/interview \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MOCK",
    "resumeText": "Senior Engineer with 5 years Node.js experience",
    "jdText": "Looking for Full Stack Engineer with Node.js and React"
  }'
```

If successful, you'll get:
```json
{
  "success": true,
  "sessionId": "clx...",
  "resumeId": "clx...",
  "jdId": "clx..."
}
```

Then start interview:
```bash
curl -X POST http://localhost:4000/api/interview/SESSION_ID/start \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Expected output includes questions:
```json
{
  "success": true,
  "sessionId": "...",
  "status": "ACTIVE",
  "questions": [
    "What experience do you have with async/await patterns in Node.js?",
    "How would you optimize a slow SQL query?",
    "Design a real-time notification system for 1 million users"
  ]
}
```

---

## Features Using Claude

### 1. Question Generation (RAG)
- Reads resume + job description
- Generates 3 progressive questions
- Context-aware based on candidate skills

### 2. Answer Evaluation
- Evaluates on 4 dimensions:
  - Technical Accuracy (0-10)
  - Completeness (0-10)
  - Clarity (0-10)
  - Depth of Understanding (0-10)
- Returns feedback and follow-up question

### 3. Resume Parsing
- Extracts skills, experience, education
- Generates professional summary
- Identifies key highlights

### 4. Final Report Generation
- Synthesizes all answers
- Generates overall scores (0-100)
- Provides detailed feedback
- Recommends HIRE / DO_NOT_HIRE / MAYBE

---

## Costs Breakdown

| Operation | Input Tokens | Output Tokens | Cost |
|-----------|--------------|---------------|------|
| Parse resume | 500 | 200 | $0.003 |
| Generate 3 questions | 1000 | 300 | $0.005 |
| Evaluate 1 answer | 600 | 150 | $0.003 |
| Generate final report | 2000 | 400 | $0.010 |
| **Total per interview** | **~4100** | **~1050** | **~$0.021** |

**Per 1000 interviews**: ~$21

---

## Rate Limits

Claude API has these rate limits:

- **Requests per minute**: 30 RPM (free tier)
- **Requests per day**: 500/day (free tier)
- **Tokens per minute**: 50,000 TPM

For production, switch to Pro plan for higher limits.

---

## Model Selection

xHire uses **`claude-3-5-sonnet-20241022`**:

- Best performance/cost ratio
- Perfect for interview evaluation
- Fast response times (< 1 second)

Other options available:
- `claude-3-opus` — More capable, slower, more expensive
- `claude-3-sonnet` — Older version, use 3.5 instead
- `claude-3-haiku` — Cheaper but less capable

---

## Troubleshooting

### Error: "Invalid API key"
- Verify `ANTHROPIC_API_KEY` is set in `.env`
- Check key starts with `sk-ant-`
- Generate new key if lost

### Error: "Rate limit exceeded"
- Reduce question generation frequency
- Implement caching for similar resumes
- Upgrade to Pro plan

### Error: "Invalid request"
- Check resume/JD text is not empty
- Verify JSON payload is correct
- Check text is plain text (not binary)

### Slow response times
- Normal: 1-3 seconds for question generation
- If > 5 seconds, check network/API status
- Monitor token usage in Anthropic console

---

## Monitoring

Check API usage in Anthropic console:

1. Go to **Usage** (left sidebar)
2. View:
   - Tokens used (input + output)
   - Requests made
   - Spend to date
   - Quota remaining

---

## Security Notes

- ✅ API key stored in `.env` only
- ✅ API key never exposed to frontend
- ✅ All API calls made server-side
- ✅ No hardcoded keys in source code

---

## Next: Setup Deepgram STT

Once Claude is working, follow [SETUP_DEEPGRAM.md](SETUP_DEEPGRAM.md)

---

## Anthropic Resources

- [API Documentation](https://docs.anthropic.com)
- [API Reference](https://docs.anthropic.com/en/api/messages)
- [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-a-chatbot)
- [Console Dashboard](https://console.anthropic.com)
