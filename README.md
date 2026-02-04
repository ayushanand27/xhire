# 🎯 xHire - Collaborative Technical Interview Platform

Real-time collaborative coding platform for technical interviews, pair programming, and online coding practice with HD video calls, live code editor, and AI-powered features.

## ✨ Features

- **Real-time Code Collaboration** - Instant code sync with cursor tracking
- **HD Video Calls** - Built-in video/audio with Stream.io
- **40+ Languages** - Code execution via Piston API (JavaScript, Python, Java, etc.)
- **Live Chat** - Real-time messaging between participants
- **Practice Mode** - Solo problem solving
- **Interview Sessions** - 1-on-1 structured sessions
- **Problem Library** - Curated coding problems by difficulty
- **Analytics** - Track sessions and progress

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Stream.io account

### Installation

```bash
# Clone repository
git clone <repo-url>
cd xhire

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Configure environment
# backend/.env
PORT=4000
DB_URL=mongodb+srv://...
CLERK_SECRET_KEY=...
STREAM_API_KEY=...
STREAM_API_SECRET=...

# frontend/.env.local
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_API_URL=http://localhost:4000/api
VITE_SERVER_URL=http://localhost:4000
```

### Run Servers

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open: `http://localhost:5173`

## 📁 Project Structure

```
xhire/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app
│   │   ├── controllers/        # API logic
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth, logging
│   │   └── lib/                # Utilities
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/              # Page components
    │   ├── components/         # UI components
    │   ├── hooks/              # Custom hooks
    │   ├── api/                # API clients
    │   ├── lib/                # Utilities
    │   └── main.jsx            # Entry point
    └── package.json
```

## 🔌 API Endpoints

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session
- `GET /api/sessions` - List sessions
- `PUT /api/sessions/:id/join` - Join session
- `PUT /api/sessions/:id/end` - End session

### Problems
- `GET /api/problems` - List problems
- `GET /api/problems/:id` - Get problem

### Code Execution
- `POST /api/code/execute` - Execute code
- `POST /api/code/test/:id` - Run tests

### Chat
- `GET /api/chat/:sessionId` - Get messages
- `POST /api/chat/:sessionId` - Send message

## 🔗 Real-time Features

### Socket.IO Events
- `join:session` - Join session room
- `code:change` - Code editor update
- `cursor:move` - Cursor position
- `message:send` - Chat message

## 🛠️ Tech Stack

**Backend**: Node.js, Express, MongoDB, Socket.IO, Clerk, Stream.io, Piston API  
**Frontend**: React 19, Vite, Tailwind CSS, DaisyUI, Monaco Editor, TanStack Query  
**Real-time**: Socket.IO, Stream.io SDK  
**Authentication**: Clerk JWT

## 📝 Environment Variables

### Backend (.env)
```
PORT=4000
NODE_ENV=development
DB_URL=mongodb+srv://...
CLIENT_URL=http://localhost:5173
CLERK_SECRET_KEY=your_key
STREAM_API_KEY=your_key
STREAM_API_SECRET=your_key
OPENAI_API_KEY=your_key
```

### Frontend (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=your_key
VITE_API_URL=http://localhost:4000/api
VITE_SERVER_URL=http://localhost:4000
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub → Connect Vercel → Deploy
# Set root: ./frontend
```

### Backend (Railway.app)
```bash
# Connect GitHub → Select backend folder → Deploy
```

## 📊 Performance

- Load problems: < 1s
- Create session: < 3s
- Code execution: < 5s
- Chat latency: < 100ms
- Video startup: < 5s

## 🔐 Security

- JWT authentication with Clerk
- Protected API routes
- CORS configured
- Rate limiting enabled
- Input validation
- Error sanitization

## 🐛 Troubleshooting

**Servers won't start**
```bash
# Kill existing processes
taskkill /F /IM node.exe

# Start again
cd backend && npm start
cd frontend && npm run dev
```

**Database connection error**
- Verify DB_URL in .env
- Check MongoDB Atlas IP whitelist

**Clerk token error**
- Verify keys are correct
- Check localhost:5173 in Clerk settings

## 📞 Support

For issues, check:
- Backend logs in terminal
- Browser console (F12)
- Network tab for API calls

## 📄 License

MIT

---

**Status**: Production Ready ✅  
**Version**: 1.0.0  
**Last Updated**: February 2026
