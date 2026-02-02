# xHire - Real-Time Collaborative Coding Platform

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen) ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

**xHire** is a full-stack, real-time collaborative coding platform designed for remote technical interviews, pair programming, and collaborative problem-solving sessions. It combines video conferencing, live code editing, automatic code execution, and AI-powered test generation into a seamless experience.

---

## 🚀 Features

### 📹 Video & Audio Communication
- **Multi-user video calls** with Stream.io SDK
- **Audio/video controls** per participant
- **Screen sharing** with real-time synchronization
- **Speaker layout** for video participants
- **Participant management** with presence tracking

### 💻 Collaborative Coding
- **Real-time code editor** synchronized across all participants
- **Multi-language support**: JavaScript, Python, Java
- **Live code execution** via Piston API
- **Syntax highlighting** and auto-indentation
- **Permission-based execution** control

### 🧪 Intelligent Testing
- **AI-powered test generation** using OpenAI GPT-4o-mini
- **Automatic test execution** with detailed results
- **Pass/fail indicators** for each test case
- **Input/output comparison** with deep equality checks
- **Error capture and display**

### 💬 Real-Time Collaboration
- **Chat messaging** with Stream Chat SDK
- **Message reactions** and threading
- **Activity logging** for all events
- **Cursor position sync** across editors
- **Role-based permissions** system

### 🎯 Session Management
- **Interview sessions** with host-participant model
- **Problem-based sessions** with coding challenges
- **Session status tracking** (active/completed)
- **Room management** with public/private options
- **Recording capabilities**

---

## 🏗️ Architecture

### Technology Stack

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Real-time**: Socket.io 4.x for WebSocket communication
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk OAuth 2.0
- **Task Queue**: Inngest for async operations

#### **Frontend**
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router 7
- **State Management**: TanStack React Query 5
- **Styling**: Tailwind CSS + DaisyUI
- **HTTP Client**: Axios

#### **External Services**
- **Video/Chat**: Stream.io SDK
- **Code Execution**: Piston API (emkc.org)
- **AI Testing**: OpenAI GPT-4o-mini
- **Authentication**: Clerk
- **Background Jobs**: Inngest

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - Video Call UI (Stream.io)                    │   │
│  │  - Shared Code Editor (Socket.io sync)          │   │
│  │  - Chat Panel (Stream Chat)                     │   │
│  │  - Test Generation & Execution                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕
              HTTP/WebSocket Communication
                           ↕
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express + Socket.io)              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - REST API (45+ endpoints)                     │   │
│  │  - Socket.io Events (20+ real-time events)      │   │
│  │  - Code Execution Handler (Piston integration)  │   │
│  │  - Test Generation (OpenAI integration)         │   │
│  │  - Authentication Middleware (Clerk)            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                      │
│  - MongoDB (Database)                                   │
│  - Stream.io (Video/Chat)                               │
│  - Piston API (Code Execution)                          │
│  - OpenAI (Test Generation)                             │
│  - Clerk (Authentication)                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
xhire/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Express server entry point
│   │   ├── lib/
│   │   │   ├── socket.js             # Socket.io event handlers
│   │   │   ├── piston.js             # Code execution library
│   │   │   ├── stream.js             # Stream.io client setup
│   │   │   ├── openai.js             # OpenAI integration
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   └── inngest.js            # Background jobs
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Room.js               # Room with participants
│   │   │   ├── Session.js            # Interview sessions
│   │   │   ├── Chat.js               # Chat messages
│   │   │   ├── Activity.js           # Event logging
│   │   │   └── ...
│   │   ├── controllers/
│   │   │   ├── roomController.js     # Room CRUD operations
│   │   │   ├── sessionController.js  # Session management
│   │   │   ├── testController.js     # Test generation/execution
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── roomRoutes.js
│   │   │   ├── sessionRoute.js
│   │   │   ├── testRoutes.js
│   │   │   └── ...
│   │   └── middleware/
│   │       └── protectRoute.js       # Auth middleware
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # App entry point
│   │   ├── App.jsx                   # Root component
│   │   ├── pages/
│   │   │   ├── RoomPage.jsx          # Main collaboration room
│   │   │   ├── SessionPage.jsx       # Interview session
│   │   │   ├── DashboardPage.jsx     # User dashboard
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── SharedCodeEditor.jsx  # Real-time code editor
│   │   │   ├── VideoCallUI.jsx       # Video interface
│   │   │   ├── ChatPanel.jsx         # Chat component
│   │   │   ├── ParticipantsList.jsx  # User management
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useRoomSocket.js      # Socket.io hook
│   │   │   ├── useRoomStreamClient.js # Stream.io hook
│   │   │   └── ...
│   │   ├── api/
│   │   │   ├── rooms.js              # Room API calls
│   │   │   ├── tests.js              # Test API calls
│   │   │   └── ...
│   │   └── lib/
│   │       ├── piston.js             # Code execution
│   │       ├── stream.js             # Stream setup
│   │       └── axios.js              # HTTP client
│   └── package.json
│
├── package.json                      # Root package.json
├── README.md                         # This file
└── deploy.sh                         # Deployment script
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Stream.io Account** ([Sign up](https://getstream.io/))
- **OpenAI API Key** ([Get key](https://platform.openai.com/))
- **Clerk Account** ([Sign up](https://clerk.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/xhire.git
   cd xhire
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, backend, frontend)
   npm run install-deps
   
   # Or install separately
   npm install              # Root dependencies
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=4000
   DB_URL=your_mongodb_connection_string
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # Stream.io credentials
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   
   # OpenAI API
   OPENAI_API_KEY=your_openai_api_key
   
   # Inngest (for background jobs)
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:4000
   VITE_STREAM_API_KEY=your_stream_api_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start separately
   npm run dev:backend      # Backend on http://localhost:4000
   npm run dev:frontend     # Frontend on http://localhost:5173
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Health check: http://localhost:4000/health

---

## 🔧 How It Works

### 1. Code Execution Flow

```
User writes code in editor
         ↓
User clicks "Execute Code"
         ↓
Frontend validates permissions
         ↓
Socket.io emits "execute-code" event
         ↓
Backend receives event and validates user
         ↓
Backend calls Piston API with code
         ↓
Piston API executes code in sandbox
         ↓
Returns output/errors
         ↓
Backend broadcasts results to all participants
         ↓
All users see output in real-time
```

**Key Files:**
- Frontend: `frontend/src/components/SharedCodeEditor.jsx`
- Backend: `backend/src/lib/socket.js` (event handler)
- Execution: `backend/src/lib/piston.js` (Piston API client)

### 2. Test Generation & Execution Flow

```
User provides problem description
         ↓
Frontend calls /api/tests/generate
         ↓
Backend sends prompt to OpenAI GPT-4o-mini
         ↓
OpenAI generates structured test cases
         ↓
Backend returns test array to frontend
         ↓
User clicks "Run Tests"
         ↓
Backend creates test harness with user code
         ↓
Executes harness via Piston API
         ↓
Compares actual vs expected output
         ↓
Returns pass/fail results for each test
         ↓
Frontend displays results with visual feedback
```

**Key Files:**
- Controller: `backend/src/controllers/testController.js`
- OpenAI: `backend/src/lib/openai.js`
- Frontend: `frontend/src/pages/SessionPage.jsx`

### 3. Real-Time Collaboration Flow

```
User types in code editor
         ↓
Debounced socket emission (300ms)
         ↓
Socket.io sends "code-updated" event
         ↓
Backend validates and saves to database
         ↓
Backend broadcasts to all room participants
         ↓
Other users receive updated code
         ↓
Their editors update automatically
```

**Key Files:**
- Hook: `frontend/src/hooks/useRoomSocket.js`
- Backend: `backend/src/lib/socket.js`
- Model: `backend/src/models/Room.js`

### 4. Video Call Setup Flow

```
User joins room
         ↓
Frontend requests Stream token via API
         ↓
Backend generates token with user ID
         ↓
Frontend initializes Stream Video client
         ↓
Creates/joins video call using room ID
         ↓
Stream.io handles WebRTC connections
         ↓
Video call established with participants
```

**Key Files:**
- Hook: `frontend/src/hooks/useRoomStreamClient.js`
- Backend: `backend/src/lib/stream.js`
- Component: `frontend/src/components/VideoCallUI.jsx`

---

## 🎯 API Endpoints

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - List all rooms (with filters)
- `GET /api/rooms/:roomId` - Get room details
- `PUT /api/rooms/:roomId` - Update room
- `DELETE /api/rooms/:roomId` - Delete room
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/leave` - Leave room
- `GET /api/rooms/:roomId/stream-token` - Get Stream.io token

### Participants
- `GET /api/rooms/:roomId/participants` - List participants
- `PUT /api/rooms/:roomId/participants/:id/role` - Update role
- `PUT /api/rooms/:roomId/participants/:id/permissions` - Update permissions
- `DELETE /api/rooms/:roomId/participants/:id` - Remove participant

### Tests
- `POST /api/tests/generate` - Generate test cases (AI)
- `POST /api/tests/run` - Execute tests against code

### Sessions
- `POST /api/sessions` - Create interview session
- `GET /api/sessions/active` - Get active sessions
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/end` - End session

### Chat
- `GET /api/rooms/:roomId/chat/history` - Get chat history
- `POST /api/rooms/:roomId/chat` - Send message
- `PUT /api/rooms/:roomId/chat/:messageId` - Edit message
- `DELETE /api/rooms/:roomId/chat/:messageId` - Delete message

---

## 🔐 Security

- **Authentication**: Clerk OAuth 2.0 integration
- **Authorization**: Role-based access control (RBAC)
- **Permissions**: Fine-grained permissions (canEdit, canExecute, canScreenShare, canChat, canMute)
- **Code Execution**: Sandboxed via Piston API (no system access)
- **Data Encryption**: HTTPS/WSS for all communications
- **Input Validation**: Comprehensive validation on all endpoints
- **Error Handling**: Secure error messages (no sensitive data leakage)

---

## 🚀 Deployment

### Backend (Railway/Heroku)

1. **Connect repository** to Railway or Heroku
2. **Set environment variables** in platform dashboard
3. **Deploy** automatically from main branch

**Configuration Files:**
- `Procfile` - Heroku process configuration
- `railway.json` - Railway deployment configuration

### Frontend (Vercel)

1. **Connect repository** to Vercel
2. **Set root directory** to `frontend`
3. **Configure environment variables**
4. **Deploy** automatically from main branch

**Configuration:**
- `frontend/vercel.json` - Vercel configuration

### Database (MongoDB Atlas)

1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP addresses or allow from anywhere
3. Copy connection string to `DB_URL` environment variable

---

## 📊 Database Schema

### Collections

1. **users** - User accounts (synced with Clerk)
2. **rooms** - Collaboration rooms with participants
3. **sessions** - Interview sessions
4. **chats** - Chat messages
5. **activities** - Event logs
6. **recordings** - Recording metadata
7. **userpreferences** - User settings

### Example Room Document

```javascript
{
  _id: ObjectId("..."),
  name: "Technical Interview - Senior Developer",
  description: "System design and coding assessment",
  creator: ObjectId("..."),
  roomType: "interview",
  isPublic: false,
  participants: [
    {
      userId: ObjectId("..."),
      role: "creator",
      permissions: {
        canEdit: true,
        canExecute: true,
        canScreenShare: true,
        canChat: true,
        canMute: true
      },
      joinedAt: ISODate("2026-02-02T10:00:00Z"),
      isActive: true
    }
  ],
  sharedCode: {
    code: "function solution() { ... }",
    language: "javascript",
    lastEditedBy: ObjectId("..."),
    lastEditedAt: ISODate("2026-02-02T10:05:00Z")
  },
  status: "active",
  createdAt: ISODate("2026-02-02T10:00:00Z")
}
```

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Create a room and invite participants
- [ ] Test video/audio on/off controls
- [ ] Share screen and verify sync
- [ ] Write code in shared editor
- [ ] Execute code and verify output
- [ ] Generate tests from problem description
- [ ] Run tests and verify results
- [ ] Send chat messages
- [ ] Update participant roles/permissions
- [ ] Start/stop recording

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Stream.io](https://getstream.io/) - Video and chat infrastructure
- [Piston API](https://github.com/engineer-man/piston) - Code execution engine
- [OpenAI](https://openai.com/) - AI-powered test generation
- [Clerk](https://clerk.com/) - Authentication service
- [MongoDB](https://www.mongodb.com/) - Database

---

## 📧 Support

For support, email support@xhire.dev or open an issue in the repository.

---

**Built with ❤️ by the xHire Team**

