# Quick Setup Guide - POS Terminal Tauri App

## 🚀 Getting Started (5 minutes)

### Step 1: Install Dependencies
```bash
cd apps/pos-terminal
pnpm install
```

### Step 2: Create Environment File
Create `apps/pos-terminal/.env.local`:
```env
VITE_API_URL=http://localhost:3001
VITE_TERMINAL_ID=POS-001
```

### Step 3: Update API Base URL
Edit `apps/pos-terminal/src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001'
```

### Step 4: Run Development Server
```bash
pnpm dev
```

### Step 5: Test Login
- Navigate to http://localhost:5173
- Open browser console (F12)
- Check for any errors
- Try PIN entry (any 4 digits for now)

---

## 🔌 API Integration

### Authentication Flow
1. User enters 4-digit PIN
2. Client sends to `/auth/login-pin` endpoint
3. Server validates PIN against bcrypt hash in database
4. Server returns User object with token
5. Token stored in localStorage
6. Authenticated requests include token in Authorization header

### Database Seeding
The seed data includes test users:
```sql
-- From your seed.ts
INSERT INTO users (name, email, pin, role, is_active)
VALUES 
  ('Juan Dela Cruz', NULL, 'hashed_1234', 'cashier', true),
  ('Maria Santos', NULL, 'hashed_5678', 'manager', true),
  -- ... more users
```

---

## 🧪 Testing Scenarios

### Login Test
- PIN: 1234 (or whatever is in your seeds)
- Expected: Redirects to /dashboard
- User info appears in top bar

### Product Test
- Home page shows categories
- Clicking category filters products
- Can add items to cart
- Cart updates total automatically

### User Management Test (Manager/Owner only)
- Navigate to /users
- Should see user list
- Can create new users
- Can edit existing users
- Can deactivate users

---

## 🎯 Key Features Implemented

✅ **Authentication**
- PIN-based login with visual keypad
- JWT token management
- Protected routes with role checking
- Auto-logout on token expiry

✅ **POS Interface**
- Product grid with categories
- Real-time cart management
- Stock tracking with warnings
- Multiple payment methods
- Order creation

✅ **User Management**
- Create/edit/deactivate users
- Role-based access (Owner, Manager, Supervisor, Cashier)
- User activity logging
- Permission checking

✅ **State Management**
- Zustand stores for auth & POS
- Persistent session data
- Real-time cache updates

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot find module '@/types'"
**Fix:** Use relative imports:
```typescript
import { User } from '../types'  // Correct
// Instead of:
import { User } from '@/types'  // Wrong
```

### Issue: "API requests failing"
**Fix:** Check:
1. API server is running on port 3001
2. VITE_API_URL is correct in .env.local
3. CORS is enabled on backend
4. API endpoints exist

### Issue: "Tailwind styles not applying"
**Fix:** Make sure index.css is imported in main.tsx:
```typescript
import './index.css'
```

### Issue: "Router not working"
**Fix:** Ensure BrowserRouter is in App.tsx:
```typescript
import { BrowserRouter as Router } from 'react-router-dom'
```

---

## 📱 Next: Mobile/Responsive

The UI is optimized for:
- ✅ Desktop POS terminals (1024x768 minimum)
- ✅ Laptop displays
- Future: Tablet support

---

## 📞 Troubleshooting

1. **Check browser console** - F12
2. **Check network tab** - See which requests fail
3. **Check Redux DevTools** - Zustand integration
4. **Check Tauri logs** - Right-click > Inspect

---

**Ready to test? Run `pnpm dev` now! 🎉**
