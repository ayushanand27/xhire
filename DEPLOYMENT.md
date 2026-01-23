# Talent-IQ Deployment Guide

## 🚀 Quick Deployment (Railway)

Railway auto-detects Node.js + Express and deploys everything!

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Railway auto-detects it's a Node.js project
5. Add environment variables:
   ```
   DB_URL=your_mongodb_url
   CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   STREAM_API_KEY=your_stream_key
   STREAM_API_SECRET=your_stream_secret
   INNGEST_EVENT_KEY=your_inngest_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key
   CLIENT_URL=your_railway_deployment_url
   NODE_ENV=production
   ```
6. Deploy! Railway builds and runs everything automatically

### Step 3: Frontend on Vercel
1. Go to https://vercel.com
2. Click "Add New Project" → "Import Git Repository"
3. Select this repo, root directory: `./frontend`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-railway-backend-url
   VITE_STREAM_API_KEY=your_stream_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   ```
5. Deploy!

## 📋 Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=production
DB_URL=mongodb+srv://user:password@...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
STREAM_API_KEY=...
STREAM_API_SECRET=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env.local)
```
VITE_API_URL=https://your-backend-url.railway.app
VITE_STREAM_API_KEY=your_key
VITE_CLERK_PUBLISHABLE_KEY=your_key
```

## ✅ Deployment Checklist

- [x] Frontend builds successfully
- [x] Backend compiles without errors
- [x] All dependencies installed
- [x] Environment variables configured
- [x] MongoDB connection string available
- [x] Clerk authentication configured
- [x] Stream.io API keys available
- [x] Socket.io WebSocket ready

## 🔄 Auto-Deployment

Both Railway and Vercel support auto-deployment:
- Push to main branch → automatic rebuild & deploy
- Zero-downtime deployments
- Automatic SSL/HTTPS

## 🆘 Troubleshooting

**Backend won't start:**
- Check DB_URL is correct
- Verify IP whitelist on MongoDB Atlas
- Check all env variables are set

**Frontend won't connect:**
- Verify VITE_API_URL points to backend
- Check CORS headers in backend
- Ensure Socket.io connection works

**Socket.io connection fails:**
- Verify CLIENT_URL env variable
- Check allowEIO3 in socket.io config
- Enable WebSocket in platform settings

## 📊 Architecture

```
Frontend (React + Vite)
    ↓ (HTTPS)
Vercel (Static + API proxy)
    ↓ (HTTP)
Backend (Express + Node.js)
    ↓ (TCP)
Railway (Compute)
    ↓ (Network)
MongoDB Atlas (Database)
```

## 🎯 Next Steps

1. Create GitHub account if needed
2. Push repository to GitHub
3. Create Railway.app account
4. Create Vercel account
5. Connect and deploy!

That's it! Your app will be live in minutes. 🎉
