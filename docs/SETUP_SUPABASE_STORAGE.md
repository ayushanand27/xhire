# Setup: Supabase Storage (File Uploads)

This guide walks you through setting up Supabase Storage for resume uploads and report storage.

## Why Supabase Storage?

- Easy file upload/download
- Works with same PostgreSQL database
- Built-in authentication
- Public/private file access
- Scalable and cost-effective
- CDN integration for fast downloads

---

## Step 1: Create Storage Bucket

1. Go to Supabase dashboard → **Storage** (left sidebar)
2. Click **"New bucket"**
3. Configure:
   - **Bucket name**: `resumes`
   - **Privacy**: Private (can change to Public)
   - **File size limit**: 50 MB
4. Click **"Create bucket"**

Repeat for second bucket:
- **Bucket name**: `reports`

---

## Step 2: Get Connection Info

Your Supabase project already has:
- `SUPABASE_URL` — Your project URL
- `SUPABASE_KEY` — Your anonymous key

These are already in `backend/.env` from Supabase setup.

---

## Step 3: Verify .env Configuration

In `backend/.env`:
```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

In `frontend/.env.local`:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

---

## How Storage Works

### Upload Resume (Backend)

```javascript
// backend/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function uploadResume(file, userId) {
  const filename = `${userId}-${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filename, file);
  
  if (error) throw error;
  
  return data;
}
```

### Download Resume (Backend)

```javascript
export async function downloadResume(storagePath) {
  const { data, error } = await supabase.storage
    .from('resumes')
    .download(storagePath);
  
  if (error) throw error;
  
  return data;
}
```

### Get Public URL

```javascript
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}
```

---

## Step 4: API Endpoints for File Upload

### Upload Resume Endpoint

```javascript
// backend/src/routes/interviewRoutesV2.js
router.post('/:id/upload-resume', protectRoute, uploadResume);

// backend/src/controllers/interviewControllerV2.js
export async function uploadResume(req, res) {
  try {
    const file = req.file; // from multer middleware
    const { sessionId } = req.params;
    
    // Validate file
    if (!file) return res.status(400).json({ error: 'No file' });
    if (!['application/pdf', 'text/plain'].includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Upload to Supabase
    const filename = `${sessionId}-${Date.now()}.${file.mimetype === 'application/pdf' ? 'pdf' : 'txt'}`;
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filename, file.buffer);
    
    if (error) throw error;
    
    // Save path to database
    await prisma.resume.create({
      data: {
        userId: req.userId,
        storagePath: data.path,
        filename: file.originalname
      }
    });
    
    res.json({ success: true, path: data.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Download Report Endpoint

```javascript
export async function downloadReport(req, res) {
  try {
    const { reportId } = req.params;
    
    const report = await prisma.evaluation.findUnique({
      where: { id: reportId }
    });
    
    if (!report?.reportPath) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const file = await supabase.storage
      .from('reports')
      .download(report.reportPath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## Step 5: Frontend File Upload

### Upload Component

```javascript
// frontend/src/components/ResumeUpload.jsx
import { useAuth } from '@clerk/react';
import { useState } from 'react';

export default function ResumeUpload({ interviewId }) {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/interview/${interviewId}/upload-resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Resume uploaded!');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } finally {
      setUploading(false);
    }
  }
  
  return (
    <input
      type="file"
      accept=".pdf,.txt"
      onChange={handleUpload}
      disabled={uploading}
    />
  );
}
```

---

## File Structure in Storage

### Resumes Bucket
```
resumes/
├── user-123-1715000000.pdf
├── user-123-1715100000.pdf
└── user-456-1715050000.txt
```

### Reports Bucket
```
reports/
├── eval-789-1715200000.pdf
├── eval-790-1715210000.pdf
└── eval-791-1715220000.html
```

---

## Storage Policies (Security)

### Private Bucket (Resumes)
- Users can only access own resumes
- Recruiters can access candidate resumes with permission

Configure in Supabase:

```sql
-- Policy: Users can upload their own resumes
CREATE POLICY "Users can upload resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can read their own resumes
CREATE POLICY "Users can read own resumes"
ON storage.objects
FOR SELECT
USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## File Type Support

### Supported Resume Formats

| Format | MIME Type | Notes |
|--------|-----------|-------|
| PDF | `application/pdf` | ✅ Recommended |
| Plain Text | `text/plain` | ✅ Supported |
| Word (.docx) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Can implement |
| RTF | `application/rtf` | Not recommended |

### Supported Report Formats

| Format | MIME Type | Use Case |
|--------|-----------|----------|
| PDF | `application/pdf` | ✅ Downloads |
| HTML | `text/html` | ✅ Email |
| JSON | `application/json` | ✅ API |

---

## Cost Calculation

### Pricing
- Storage: $5/100 GB/month
- Transfer: First 2 GB/month free, then $0.12/GB

### Example
- 1000 resumes × 1 MB = 1 GB = **$0.05/month** (storage)
- Downloads: 100 resumes/month × 1 MB = 100 MB = **Free** (under 2 GB)
- **Total**: ~$5/month for 100+ users

---

## Testing Upload/Download

### Test Upload (with Postman)

1. Get auth token from Clerk
2. POST to `http://localhost:4000/api/interview/SESSION_ID/upload-resume`
3. Add file as multipart form data
4. Expected response:
```json
{
  "success": true,
  "path": "resumes/user-123-1715000000.pdf"
}
```

### Test Download

```bash
curl -X GET http://localhost:4000/api/interview/EVAL_ID/download-report \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -o report.pdf
```

---

## Troubleshooting

### Error: "Bucket not found"
- Verify bucket names are correct in Supabase
- Check `SUPABASE_URL` and `SUPABASE_KEY`
- Restart backend

### Upload fails with 403
- Check file permissions in bucket policy
- Verify `SUPABASE_ANON_KEY` has correct permissions
- Check file size < limit (50 MB default)

### Can't access files
- Verify bucket is "Private" if restricting access
- Check RLS policies are correct
- Verify authentication token is valid

### Slow uploads
- Check file size (large PDFs slow)
- Verify network bandwidth
- Try chunked upload for large files

---

## Security Best Practices

- ✅ Keep bucket "Private" by default
- ✅ Enable RLS policies for row-level security
- ✅ Set reasonable file size limits
- ✅ Virus scan uploaded files (optional)
- ✅ Delete old files after retention period
- ✅ Encrypt sensitive files (if needed)

---

## Advanced Features

### Virus Scanning
Integrate ClamAV or similar:
```javascript
const scanned = await scanVirusWithClamAV(file.buffer);
if (scanned.infected) {
  throw new Error('File infected');
}
```

### Image Optimization
For profile pictures:
```javascript
const resized = await sharp(file.buffer)
  .resize(200, 200)
  .toBuffer();
```

### Duplicate Prevention
```javascript
const hash = crypto.createHash('md5')
  .update(file.buffer)
  .digest('hex');
```

---

## Phase 1 Complete ✅

All 6 API services configured:
1. ✅ Supabase PostgreSQL (database)
2. ✅ Claude API (AI evaluation)
3. ✅ Deepgram API (speech-to-text)
4. ✅ Clerk (authentication)
5. ✅ Stream.io (video recording)
6. ✅ Supabase Storage (file uploads)

---

## Next Steps

1. **Setup all 6 APIs** in order using the setup guides
2. **Configure .env files** on backend and frontend
3. **Run `npm run prisma:push`** to create database tables
4. **Run `npm run prisma:seed`** to seed test data
5. **Start backend**: `npm run dev` (backend folder)
6. **Start frontend**: `npm run dev` (frontend folder)
7. **Test complete flow**: Create interview → Start → Answer → Complete
8. **Deploy** to production

---

## Supabase Resources

- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage API](https://supabase.com/docs/reference/javascript/storage-createbucket)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Dashboard](https://supabase.com/dashboard)
