# xHire - Collaborative Coding Platform

Real-time collaborative coding platform for technical interviews, pair programming, and problem-solving with video calls, live code editor, and AI-powered test generation.

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Stream.io** API Key ([Get free](https://getstream.io/))
- **OpenAI** API Key ([Get key](https://platform.openai.com/))
- **Clerk** API Key ([Get key](https://clerk.com/))

---

## 📋 Setup Steps

### 1. Clone & Navigate
```bash
git clone https://github.com/yourusername/xhire.git
cd xhire
```

### 2. Install Dependencies
```bash
# Install all at once
npm run install-deps

# Or install separately
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Create Environment Files

**Backend** - Create `backend/.env`:
```env
PORT=4000
NODE_ENV=development
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/xhire
CLIENT_URL=http://localhost:5173

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

OPENAI_API_KEY=your_openai_api_key

INNGEST_EVENT_KEY=your_inngest_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_STREAM_API_KEY=your_stream_api_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### 4. Run Locally

**Option A: Both simultaneously**
```bash
npm run dev
```

**Option B: Separately (two terminals)**

Terminal 1 - Backend:
```bash
npm run dev:backend
# Runs on http://localhost:4000
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
# Runs on http://localhost:5173
```

### 5. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

---

## ✨ Features

### 🎥 Video & Audio
- Multi-user video calls
- Audio/video on/off controls
- Screen sharing
- Participant tracking

### 💻 Code Collaboration
- Real-time code editor (JavaScript, Python, Java)
- **Live code execution** (Piston API)
- Cursor position sync
- Font size adjustment

### 🧪 Testing
- **AI test generation** (OpenAI GPT-4o-mini)
- **Automatic test execution** (Piston)
- Pass/fail results
- Error display

### 👥 Team Management
- Create rooms
- Role-based access (creator, presenter, viewer)
- Permission control (canEdit, canExecute, canScreenShare)
- User blocking & favorites

### 💬 Communication
- Real-time chat (Stream Chat)
- Message reactions
- Activity logging
- Session tracking

---

## 📁 Project Structure

```
xhire/
├── backend/
│   └── src/
│       ├── server.js              # Express server
│       ├── lib/
│       │   ├── socket.js          # Real-time events
│       │   ├── piston.js          # Code execution
│       │   ├── stream.js          # Video/chat setup
│       │   ├── openai.js          # AI test generation
│       │   └── db.js              # MongoDB
│       ├── models/                # Database schemas
│       ├── controllers/           # Business logic
│       ├── routes/                # API endpoints
│       └── middleware/            # Auth & middleware
│
├── frontend/
│   └── src/
│       ├── pages/                 # Page components
│       ├── components/            # UI components
│       ├── hooks/                 # Custom hooks
│       ├── api/                   # API calls
│       └── lib/                   # Utilities
│
└── README.md                      # This file
```

---

## 🔧 How It Works

### Code Execution
```
1. User writes code in editor
2. Clicks "Execute Code"
3. Backend receives code via Socket.io
4. Calls Piston API to execute in sandbox
5. Gets output/errors
6. Broadcasts results to all participants
7. All users see output instantly
```

### Test Generation
```
1. User provides problem description
2. Backend calls OpenAI GPT-4o-mini
3. AI generates structured tests
4. Backend creates test harness
5. Executes via Piston API
6. Returns pass/fail results
7. Frontend displays with visual feedback
```

### Real-Time Collaboration
```
1. User types code
2. Socket.io emits changes (300ms debounce)
3. Backend validates & saves
4. Broadcasts to all room participants
5. Other editors update automatically
```

---

## 🎯 API Endpoints

**Rooms**: Create, read, update, delete, join, leave, token generation  
**Participants**: List, update roles/permissions, remove  
**Tests**: Generate (AI), run (execute)  
**Sessions**: Create, join, end, list  
**Chat**: Send, edit, delete, history  
**Activity**: Log and retrieve events  
**Users**: Preferences, favorites, blocked users  

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Push to main branch - auto-deploys
# Set env vars in Vercel dashboard
```

### Backend (Railway/Heroku)
```bash
# Push to main branch - auto-deploys
# Set env vars in platform dashboard
# Use railway.json or Procfile
```

### Database (MongoDB Atlas)
```
1. Create free cluster
2. Add connection string to DB_URL
3. Auto-syncs with app
```

---

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Verify locally
# 1. Create a room
# 2. Test video/audio
# 3. Write and execute code
# 4. Generate and run tests
```

---

## 🔐 Security

- ✅ Clerk OAuth authentication
- ✅ Role-based access control
- ✅ Sandboxed code execution
- ✅ HTTPS/WSS encryption
- ✅ Input validation on all endpoints
- ✅ Secure error handling

---

## 📚 Tech Stack

**Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose  
**Frontend**: React 19, Vite, React Router, TanStack Query  
**Real-time**: Socket.io (code), Stream.io (video/chat)  
**Execution**: Piston API (sandboxed code)  
**AI**: OpenAI GPT-4o-mini (test generation)  
**Auth**: Clerk OAuth 2.0  

---

## 📞 Support

- Open an issue in the repository
- Check logs: `npm run dev:backend`
- Check console: `http://localhost:5173` (DevTools F12)

---

**Built with ❤️ - xHire Team**

