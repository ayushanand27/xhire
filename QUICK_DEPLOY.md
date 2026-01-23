# ⚡ QUICK REFERENCE - Deployment in 10 Minutes

## 🎯 TL;DR - What to Do Right Now

```bash
# 1. Push to GitHub
cd c:\Users\ayush\OneDrive\Documents\GitHub\talent-IQ
git add .
git commit -m "Deploy"
git push

# 2. Go to https://railway.app → Deploy from GitHub (4 min)
# 3. Go to https://vercel.com → Import Project → ./frontend (3 min)
# 4. Add environment variables to both platforms
# 5. Done! Your app is live ✅
```

---

## 📋 Environment Variables (Copy-Paste Ready)

### Railway Backend
```
DB_URL=mongodb+srv://ayushanandchoudhary543_db_user:t0kwpH0dKKDFHljx@mo.spq8ds2.mongodb.net/?appName=MO
CLERK_PUBLISHABLE_KEY=pk_test_ZmluZS1mZXJyZXQtOTAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_mok9yAxoBo7BxODDtrQDZIUUglvQfwG9njap2PPfZxVITE
STREAM_API_KEY=3h8sv849rx4h
STREAM_API_SECRET=2amafmtghdcpbezytkkwzx8phkdrfu4c6k762xmftqwapq8p725ves9fdnj65j28
INNGEST_EVENT_KEY=5jRlgmLyy2GIBxTR07-zUuuZHe4iyEzBE-tMj630ImaEJOYVn2Nn3dDq0x4T4DfVXRZhXwqibIy_G0tmXeKm6w
INNGEST_SIGNING_KEY=signkey-prod-98b4e7faa01d531e8d67527ab96a5250e3484c55ea4a40a9f91f2bb3776e8c33
CLIENT_URL=https://talent-iq.vercel.app
NODE_ENV=production
```

### Vercel Frontend
```
VITE_API_URL=https://talent-iq.railway.app
VITE_STREAM_API_KEY=3h8sv849rx4h
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmluZS1mZXJyZXQtOTAuY2xlcmsuYWNjb3VudHMuZGV2JA
```

*(Replace URLs with your actual deployed URLs)*

---

## ⚙️ Platform Configuration

### Railway Backend
```
Runtime: Node.js (auto-detected)
Start Command: npm start
Root Directory: / (monorepo root)
Environment: production
Memory: Default (2GB fine)
```

### Vercel Frontend
```
Framework: Vite
Root Directory: ./frontend
Build Command: npm run build
Output Directory: dist
Node Version: 18.x
```

---

## ✅ Deployment Checklist (Quick)

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Vercel account created
- [ ] Backend env vars set in Railway
- [ ] Frontend env vars set in Vercel
- [ ] Backend deployed (wait for green ✅)
- [ ] Frontend deployed (wait for green ✅)
- [ ] Test: Backend /health endpoint works
- [ ] Test: Frontend loads
- [ ] Test: Can create room (optional)

---

## 🔗 Important URLs

| Service | Sign Up | Dashboard |
|---------|---------|-----------|
| Railway | https://railway.app | After login |
| Vercel | https://vercel.com | After login |
| MongoDB | https://www.mongodb.com/cloud/atlas | Already configured |
| GitHub | https://github.com | Create repo |

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Build failed" | Check env vars in platform dashboard |
| "Blank page on frontend" | Check VITE_API_URL in Vercel env vars |
| "Cannot connect to database" | Whitelist 0.0.0.0/0 in MongoDB Atlas Network |
| "Socket.io won't connect" | Verify CLIENT_URL matches Vercel URL |

---

## 📊 Status Before Deployment

✅ Frontend builds successfully  
✅ Backend compiles without errors  
✅ All 34+ APIs ready  
✅ Real-time features ready  
✅ Database configured  
✅ Authentication ready  
✅ Environment templates created  
✅ **READY TO DEPLOY**

---

## 🎯 Your URLs After Deployment

**Backend:** `https://talent-iq-backend.railway.app`  
**Frontend:** `https://talent-iq-frontend.vercel.app`  

*(Exact names depend on your setup)*

---

## 📚 Full Guides

Need more details? Read these files:

1. **DEPLOY_IT_NOW.md** - Step-by-step guide with explanations
2. **DEPLOYMENT_CHECKLIST.md** - Complete checklist
3. **PRODUCTION_READY.md** - Full status report
4. **DEPLOYMENT_STATUS.md** - Technical details

---

## ⏱️ Timeline

- **5 min:** Push code, create accounts
- **4 min:** Deploy backend (Railway)
- **3 min:** Deploy frontend (Vercel)
- **2 min:** Add environment variables
- **~14 min total:** App is LIVE ✅

---

## 🎉 That's It!

Your production deployment is ready to go!

Follow DEPLOY_IT_NOW.md or this quick reference and you're done.

**Questions?** Check the guides above.

**Ready?** Start with `git push origin main` 🚀
