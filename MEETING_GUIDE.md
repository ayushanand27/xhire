# 🎥 xHire - Video Calling Platform Guide

## ✅ Your Platform is LIVE!

**Backend**: http://localhost:4000  
**Frontend**: http://localhost:5174  
**Status**: All systems operational 🚀

---

## 📹 How to Share Meeting Links & Host Video Calls

### **Step 1: Login**
1. Open: http://localhost:5174
2. Click "Get Started" or "Log in"
3. Sign in with Clerk (Google/Email)

### **Step 2: Create a Room (Meeting)**
1. After login, go to **Dashboard**
2. Click **"Create Room"** button
3. Fill in room details:
   - **Name**: "Team Standup", "Technical Interview", etc.
   - **Type**: Interview, Pair Programming, Team Meeting, etc.
   - **Public/Private**: Choose visibility
4. Click **"Create"**

### **Step 3: Get Meeting Link**
After creating room, you'll get a link like:
```
http://localhost:5174/room/65abc123def456789
```

### **Step 4: Share via Gmail/Email**
**Copy the room link and send via:**
- Gmail
- WhatsApp
- Slack
- Any messaging app

**Example Email:**
```
Subject: Join our coding session!

Hi team,

Join our live coding session here:
http://localhost:5174/room/65abc123def456789

See you there!
```

### **Step 5: Participants Join**
1. Recipients click the link
2. They login with Clerk (if not logged in)
3. **Auto-joins the video call** immediately
4. Can see/hear everyone
5. Can share screen
6. Can write code together

---

## 👥 Video Call Features (Up to 5 People)

### **What Each Person Can Do:**

✅ **Video & Audio**
- Turn camera on/off
- Turn microphone on/off
- See all participants in grid/speaker view
- Auto-adjusts for 1-5 people

✅ **Screen Sharing**
- Click "Share Screen" button
- Select window/entire screen
- Everyone sees your screen in real-time

✅ **Code Editor**
- Write code together (JavaScript, Python, Java)
- See each other's cursor position
- Auto-syncs every change
- Execute code and see results together

✅ **Chat**
- Send messages to all participants
- Add reactions
- Message history saved

✅ **Testing**
- Generate AI test cases (OpenAI powered)
- Run tests automatically
- See pass/fail results

---

## 🎯 Complete Workflow Example

### **Scenario: Technical Interview with Remote Candidate**

**1. Interviewer (You):**
```
1. Login → Dashboard
2. Create Room: "Senior Dev Interview - John Doe"
3. Copy link: http://localhost:5174/room/ABC123
4. Email to candidate: john@example.com
```

**2. Candidate (John):**
```
1. Receives email with link
2. Clicks link → Auto-redirects to login
3. Logs in with Clerk
4. Joins video call automatically
```

**3. During Interview:**
```
✅ Both see/hear each other (video call)
✅ Share coding problem in editor
✅ Candidate writes solution
✅ Both execute code and see output
✅ Generate tests with AI
✅ Run tests and discuss results
✅ Share screen for system design
✅ Chat for quick notes
```

**4. Recording (Optional):**
```
- Click "Start Recording"
- Saves interview for review
- Stop when done
```

---

## 🔗 Room Link Structure

**Your room links look like:**
```
http://localhost:5174/room/{ROOM_ID}
```

**Examples:**
```
http://localhost:5174/room/65abc123def456789
http://localhost:5174/room/interview-senior-dev-2024
```

**Anyone with the link can:**
- Join the room
- See video of all participants
- Participate in code editing
- Chat with others
- Share their screen

---

## 👨‍💼 Room Roles & Permissions

### **Creator (You)**
- Full control over room
- Can remove participants
- Can change permissions
- Can end session
- Can start/stop recording

### **Participants (Up to 4 Others)**
- Can join video call
- Can turn on/off camera/mic
- Can view shared code
- Permissions controlled by creator:
  - ✅ Can edit code (if allowed)
  - ✅ Can execute code (if allowed)
  - ✅ Can screen share (if allowed)
  - ✅ Can chat (if allowed)

---

## 📊 Dashboard Features

**When you login, you'll see:**

1. **Active Rooms** - Rooms you've created or joined
2. **Create New Room** - Start a new meeting
3. **Recent Sessions** - Past interview sessions
4. **Practice Problems** - Solo coding practice

---

## 🎮 Solo Practice Mode

**Not just meetings! You can also:**

1. Go to **Practice** (navbar)
2. Browse coding problems
3. Write solutions
4. Execute code
5. Generate & run tests
6. Track your progress

**No video call needed for solo practice!**

---

## 🚀 Quick Start Checklist

- [x] Backend running on port 4000
- [x] Frontend running on port 5174
- [x] MongoDB connected
- [x] Stream.io configured (video calls)
- [x] OpenAI configured (test generation)
- [x] Piston API working (code execution)

**✅ Ready to create rooms and share links!**

---

## 💡 Pro Tips

**1. Test Before Interview:**
- Create a test room
- Open in incognito window
- Test video/audio/screen share
- Ensure everything works

**2. Share Link Early:**
- Send link 5-10 minutes before
- Gives participants time to login
- Can test audio/video setup

**3. Use Room Types:**
- "Interview" - for hiring
- "Pair Programming" - for coding together
- "Team Meeting" - for standups
- "Study Group" - for learning

**4. Enable Permissions:**
- For interviews: Only interviewer edits code
- For pair programming: Everyone can edit
- For teaching: Teacher controls execution

---

## 🔐 Security & Privacy

**Your meetings are secure:**
- ✅ Clerk authentication required
- ✅ Private rooms need password
- ✅ Only logged-in users can join
- ✅ Creator controls access
- ✅ Can remove unwanted participants
- ✅ Code execution sandboxed

---

## 📧 Sharing Links - Examples

### **Via Gmail:**
```
To: candidate@example.com
Subject: Technical Interview - Tomorrow 2PM

Hi [Name],

Looking forward to our interview tomorrow!

Join here: http://localhost:5174/room/ABC123

See you then!
```

### **Via Slack:**
```
@channel Quick standup in 5 mins!
Join: http://localhost:5174/room/standup-daily
```

### **Via WhatsApp:**
```
Hey team! Let's pair program:
http://localhost:5174/room/bug-fix-session
```

---

## 🎯 Current Limits

**Platform Supports:**
- ✅ Up to 5 concurrent participants per room
- ✅ Unlimited rooms
- ✅ Unlimited sessions
- ✅ Unlimited code executions
- ✅ Video quality: HD (720p)
- ✅ Screen sharing: 1080p

**To Increase Limits:**
- Upgrade Stream.io plan for more participants
- Current setup: Perfect for interviews & small teams

---

## ✅ YOU'RE ALL SET!

**Try it now:**
1. Open: http://localhost:5174
2. Login
3. Create your first room
4. Copy the link
5. Share with someone
6. Have them join
7. Start your video call!

**Your collaborative coding platform is ready!** 🚀

---

**Need help?** Check the browser console (F12) for any errors.
