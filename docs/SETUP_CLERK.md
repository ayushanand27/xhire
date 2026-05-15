# Setup: Clerk Authentication

This guide walks you through setting up Clerk for user authentication and role management.

## Why Clerk?

- Pre-built authentication UI
- JWT tokens for API security
- Role-based access control
- Multi-factor authentication
- Production-grade security
- Simple integration with React + Node.js

---

## Step 1: Create Clerk Account

1. Go to https://dashboard.clerk.com/
2. Click **"Sign Up"**
3. Create account with:
   - Email
   - Password
4. Verify email

---

## Step 2: Create Application

1. In Clerk dashboard, click **"Create Application"**
2. Configure:
   - **Application Name**: `xhire`
   - **Select sign-in options**:
     - ☑️ Email
     - ☑️ Google (optional)
     - ☑️ GitHub (optional)
3. Click **"Create application"**

---

## Step 3: Get API Keys

1. In Clerk dashboard → **API Keys** (left sidebar)
2. Copy:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

**Save both securely**

---

## Step 4: Add to Backend .env

In `backend/.env`:
```bash
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
```

Replace with your actual keys from Step 3.

---

## Step 5: Add to Frontend .env

In `frontend/.env.local`:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

---

## Step 6: Frontend Setup (React)

Your frontend already has Clerk integration in place. Here's how it works:

### App Wrapper
```javascript
// src/App.jsx
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/react';

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <SignedOut>
        {/* Show login page */}
      </SignedOut>
      <SignedIn>
        {/* Show app */}
      </SignedIn>
    </ClerkProvider>
  );
}
```

### Get Auth Token
```javascript
// In any component
import { useAuth } from '@clerk/react';

export default function MyComponent() {
  const { getToken } = useAuth();
  
  const token = await getToken();
  // Use token in API requests
  const response = await fetch('/api/interview', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

### Get User Info
```javascript
import { useUser } from '@clerk/react';

export default function Profile() {
  const { user } = useUser();
  
  return <p>Welcome, {user?.firstName}!</p>;
}
```

---

## Step 7: Backend Setup (Express)

Your backend is already configured. Here's how it validates tokens:

### Middleware
```javascript
// middleware/protectRoute.js
import { verifyToken } from '@clerk/express';

export async function protectRoute(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    req.userId = decoded.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Protected Endpoint
```javascript
// routes/interviewRoutesV2.js
router.post('/', protectRoute, createInterview);
```

---

## Step 8: Test Authentication

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test Flow
1. Open http://localhost:3000
2. Click **"Sign Up"**
3. Create account with email
4. Accept verification email
5. You should see app
6. Create mock interview
   - Backend receives your user ID via JWT
   - Interview links to your account

---

## User Roles

### Setup Roles in Clerk

1. In Clerk dashboard → **Users** (left sidebar)
2. Find your user
3. Click user → Edit
4. Scroll to **Unsafe Metadata**
5. Add:
```json
{
  "role": "CANDIDATE"
}
```

Or via API:
```javascript
// Backend
const user = await clerk.users.updateUserMetadata(userId, {
  publicMetadata: { role: 'CANDIDATE' }
});
```

### Role Types

- `CANDIDATE` — Takes interviews, sees own evaluations
- `RECRUITER` — Creates proctored interviews, sees dashboard
- `ADMIN` — Full system access (TBD)

### Check Role in Frontend

```javascript
import { useUser } from '@clerk/react';

export default function Dashboard() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  
  return role === 'RECRUITER' ? <RecruiterDash /> : <CandidateDash />;
}
```

### Check Role in Backend

```javascript
// Controller
async function getMe(req, res) {
  const user = await db.user.findUnique({
    where: { clerkId: req.userId }
  });
  
  if (user.role === 'RECRUITER') {
    // Allow recruiter operations
  }
}
```

---

## Multi-Factor Authentication (Optional)

Enable 2FA for security:

1. In Clerk dashboard → **Sessions**
2. Enable **Require authenticator app** or **SMS**
3. Users will see 2FA prompt on sign in

---

## Custom Sign-In/Sign-Up UI

Your app uses Clerk's pre-built components. To customize:

```javascript
import { SignIn, SignUp } from '@clerk/react';

export default function AuthPage() {
  return (
    <div>
      <SignIn redirectUrl="/" />
    </div>
  );
}
```

---

## Troubleshooting

### Error: "Publishable key not found"
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in `frontend/.env.local`
- Restart frontend dev server
- Check key starts with `pk_`

### Error: "Invalid secret key"
- Verify `CLERK_SECRET_KEY` is set in `backend/.env`
- Check key starts with `sk_`
- Regenerate key if needed

### Sign-in not working
- Check email is confirmed in Clerk dashboard
- Verify sign-in method is enabled (Email, Google, etc.)
- Clear browser cache and cookies

### API returns "Unauthorized"
- User must be signed in first
- Check Authorization header includes `Bearer TOKEN`
- Verify token is valid (not expired)

### Role not showing up
- Verify metadata was set in Clerk dashboard
- Wait a few seconds for sync
- Restart frontend

---

## Security Checklist

- ✅ Never expose `CLERK_SECRET_KEY` to frontend
- ✅ Always validate tokens on backend
- ✅ Use HTTPS in production
- ✅ Enable MFA for sensitive accounts
- ✅ Rotate keys regularly
- ✅ Monitor authentication logs

---

## Production Considerations

### Deploy Backend
1. Set `CLERK_SECRET_KEY` in production environment
2. Set `CLERK_PUBLISHABLE_KEY` in frontend env

### Deploy Frontend
1. Set `VITE_CLERK_PUBLISHABLE_KEY` in build environment
2. Clerk automatically validates domain

### Allowed Origins
1. In Clerk dashboard → **Domains**
2. Add production domain
3. Example: `https://app.xhire.com`

---

## Session Management

### Keep Sessions Alive
```javascript
// Refreshes token every 5 minutes
const { getToken } = useAuth();

useEffect(() => {
  const interval = setInterval(async () => {
    await getToken({ template: 'refresh' });
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [getToken]);
```

### Sign Out
```javascript
import { useClerk } from '@clerk/react';

export default function SignOutButton() {
  const { signOut } = useClerk();
  
  return (
    <button onClick={() => signOut({ redirectUrl: '/' })}>
      Sign Out
    </button>
  );
}
```

---

## Next: Setup Stream.io for Video

Once Clerk is working, follow [SETUP_STREAM.md](SETUP_STREAM.md)

---

## Clerk Resources

- [React SDK Docs](https://clerk.com/docs/quickstarts/react)
- [Express Middleware](https://clerk.com/docs/quickstarts/node)
- [Dashboard](https://dashboard.clerk.com)
- [JWT Guide](https://clerk.com/docs/backend-requests/handling/jwt-verification)
- [API Reference](https://clerk.com/docs/reference/backend-api)
