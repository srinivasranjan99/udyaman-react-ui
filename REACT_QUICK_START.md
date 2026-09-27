# ⚡ React UI - Quick Start Guide

## 🎯 Get Running in 3 Minutes

### Step 1: Start Backend (if not already running)

```bash
cd /Users/srinivasranjan/udyaman
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Step 2: Install React Dependencies

```bash
cd /Users/srinivasranjan/udyaman-react-ui
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Opens at**: `http://localhost:5173`

---

## 🔑 Login Immediately

### Demo Credentials

**Option 1: Admin User**
```
Username: admin
Password: password
```

**Option 2: Regular User**
```
Username: user1
Password: password
```

---

## ✅ Verify Everything Works

1. ✅ Login page loads
2. ✅ Enter demo credentials
3. ✅ Dashboard appears with user info
4. ✅ Click "Users" → See user list
5. ✅ Click "Roles" → See role list
6. ✅ Menu dropdown → Logout works

---

## 📁 Project Structure

```
udyaman-react-ui/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── context/          # Auth context
│   ├── api/              # Axios config
│   └── App.jsx           # Main app
├── package.json          # Dependencies
└── public/               # Static files
```

---

## 🚀 Available Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔐 What's Included

✅ **Login/Register Pages**
✅ **Protected Routes**
✅ **JWT Token Management**
✅ **Axios Interceptors**
✅ **Global Auth Context**
✅ **User Dashboard**
✅ **User Management**
✅ **Role Management**
✅ **Material-UI Design**
✅ **Responsive Layout**

---

## 🔗 Important APIs

```javascript
import { useAuth } from './context/AuthContext';

const { 
  user,              // Current user object
  login,             // Function: (username, password) → Promise
  logout,            // Function: () → void
  hasPermission,     // Function: (permission) → boolean
  hasRole,           // Function: (role) → boolean
  isAuthenticated    // boolean
} = useAuth();
```

---

## 🎨 Key Components

| Component | Purpose |
|-----------|---------|
| **AuthContext.jsx** | Global state management |
| **ProtectedRoute.jsx** | Route protection wrapper |
| **Navbar.jsx** | Top navigation |
| **LoginPage.jsx** | User login |
| **HomePage.jsx** | Dashboard |
| **UsersPage.jsx** | User management |
| **RolesPage.jsx** | Role management |

---

## 🧪 Test Each Feature

### Login
```
1. Go to http://localhost:5173/login
2. Enter: admin / password
3. Click "Sign In"
4. Should redirect to home page
```

### User Management
```
1. Click "Users" in navbar
2. See list of all users
3. Click "Assign Role" button
4. Select a role
5. Click "Assign"
```

### Role Management
```
1. Click "Roles" in navbar
2. See list of all roles
3. View permissions for each role
4. Click "Create Role" (if admin)
5. Fill in details and create
```

### Logout
```
1. Click user menu (top right)
2. Click "Logout"
3. Should redirect to /login
4. Login page appears
```

---

## 📊 API Endpoints Used

```
POST   /api/auth/login           (public)
POST   /api/auth/register        (public)
GET    /api/users                (requires USER_READ)
POST   /api/users/{id}/roles     (requires ROLE_ASSIGN)
DELETE /api/users/{id}/roles     (requires ROLE_ASSIGN)
GET    /api/roles                (requires ROLE_READ)
POST   /api/roles                (requires ROLE_CREATE)
```

---

## ⚙️ Configuration

### API Base URL
File: `src/api/axios.js`

```javascript
const API_BASE = 'http://localhost:8080/api';
```

Change if your backend is on different port.

### Tenant ID
```javascript
config.headers['X-Tenant-ID'] = 'DEFAULT';
```

Change to your tenant if using multi-tenancy.

---

## 🐛 Debug Tips

### Check localStorage
```javascript
// In browser console
localStorage.getItem('auth_token')
localStorage.getItem('auth_user')
```

### Monitor API Calls
```
1. Open DevTools (F12)
2. Go to Network tab
3. Make a request
4. See headers and response
```

### Check Auth State
```javascript
// In any component
const { user, isAuthenticated } = useAuth();
console.log(user, isAuthenticated);
```

---

## 📚 Performance Tips

1. **Token Validation** happens on app load
2. **Axios interceptor** runs on every request
3. **Protected routes** check auth before rendering
4. **Use `hasPermission()`** for UI conditional rendering

---

## 🎁 Next Steps

After login works:
1. Explore user management
2. Check role assignments
3. Review permissions display
4. Test permission-based route access
5. Review backend logs

---

## 📞 Troubleshooting

**Backend not responding?**
```bash
# Check if backend is running
curl http://localhost:8080/api/auth/login -X POST
```

**CORS errors?**
- Backend SecurityConfig must allow localhost:5173
- Check backend logs for CORS rejection

**Token expired** 
- Logout and login again
- Token expires based on backend config

**Not allowed to see some pages**
- Check your user's roles and permissions
- Provide admin role to see all features

---

**Happy coding! 🚀**

Created: May 1, 2026
Last Updated: May 1, 2026

