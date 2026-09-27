']# 🔐 React UI - Authentication System Documentation

## Overview

Complete React authentication system with JWT token management, Authorization header interception, and 401 error handling. Fully integrated with Spring Boot backend RBAC system.

---

## ✅ What's Implemented

### 1. **Authentication Context** (`src/context/AuthContext.jsx`)
- Global auth state management using React Context
- User data persistence in localStorage
- JWT token expiration validation
- Role-based access checks
- Permission-based access checks

**Key Methods:**
```javascript
const { 
  user,              // Currently logged-in user object
  loading,           // Loading state during auth check
  login,             // Async login function
  logout,            // Clear auth data
  hasPermission,     // Check if user has permission
  hasRole,           // Check if user has role
  isAuthenticated    // Boolean authentication status
} = useAuth();
```

### 2. **Axios Interceptor** (`src/api/axios.js`)
- Automatically attaches JWT to every request header
- Global 401 error handling
- Redirects to login on token expiration
- Stores tenant ID in request headers

**Request Flow:**
```
Request → Check localStorage for JWT
       → Attach to Authorization header
       → Send with X-Tenant-ID
       ↓
Response → Handle 401 → Clear storage → Trigger callback
```

### 3. **Protected Routes** (`src/components/ProtectedRoute.jsx`)
- Route wrapper that checks authentication
- Redirects to login if not authenticated
- Shows loading spinner while checking auth state
- Prevents unauthorized access to protected pages

### 4. **Components**

#### **Navbar** (`src/components/Navbar.jsx`)
- Conditional rendering based on auth state
- User menu dropdown
- Navigation links
- Logout button

#### **Login Page** (`src/pages/LoginPage.jsx`)
- Username/password form
- Error handling and display
- Loading state during submission
- Link to registration
- Demo credentials info box

#### **Register Page** (`src/pages/RegisterPage.jsx`)
- Complete user registration form
- Password confirmation validation
- Email validation
- Success/error handling
- Auto-redirect to login after registration

#### **Home Page** (`src/pages/HomePage.jsx`)
- Personalized welcome message
- User information display
- Roles and permissions display
- Quick access cards to main features

#### **Users Management Page** (`src/pages/UsersPage.jsx`)
- List all users in table format
- View user roles
- Assign/remove roles (with permission checks)
- User status indicators
- Dialog for role assignment

#### **Roles Management Page** (`src/pages/RolesPage.jsx`)
- Display all roles as cards
- Show permissions for each role
- Create new roles (with permission checks)
- Role descriptions

### 5. **Routing** (`src/App.jsx`)
- BrowserRouter setup
- Protected and public routes
- Material-UI theme provider
- Automatic redirects
- Route hierarchy

---

## 🚀 Getting Started

### Installation

```bash
cd /Users/srinivasranjan/udyaman-react-ui
npm install
```

### Development Server

```bash
npm run dev
```

Opens at: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 📋 Project Structure

```
src/
├── api/
│   └── axios.js              # API client with interceptors
├── components/
│   ├── Navbar.jsx            # Navigation bar
│   └── ProtectedRoute.jsx    # Route protection wrapper
├── context/
│   └── AuthContext.jsx       # Global auth state
├── pages/
│   ├── LoginPage.jsx         # Login form
│   ├── RegisterPage.jsx      # Registration form
│   ├── HomePage.jsx          # Dashboard
│   ├── UsersPage.jsx         # User management
│   └── RolesPage.jsx         # Role management
├── assets/                   # Images and static files
├── App.jsx                   # Main routing component
├── main.jsx                  # React entry point
└── index.css                 # Global styles
```

---

## 🔑 Authentication Flow

### 1. **Login Process**

```javascript
// User enters credentials
const { login } = useAuth();
await login(username, password);

// Backend returns:
{
  token: "eyJhbGc...",
  username: "john_doe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  roles: ["ROLE_USER", "ROLE_ADMIN"],
  permissions: ["USER_READ", "USER_CREATE", ...]
}

// Automatically stored in localStorage:
localStorage['auth_token'] = "eyJhbGc..."
localStorage['auth_user'] = "{...user data...}"
```

### 2. **Token Validation**

```javascript
// On app load/refresh
AuthProvider checks:
1. Is JWT token in localStorage?
2. Is token still valid (expiration check)?
3. If valid → set user, otherwise clear storage

// Subsequent requests:
axios interceptor automatically attaches:
Authorization: Bearer eyJhbGc...
```

### 3. **Permission Checks**

```javascript
const { hasPermission, hasRole } = useAuth();

if (hasPermission('USER_CREATE')) {
  // Show create button
}

if (hasRole('ROLE_ADMIN')) {
  // Show admin section
}
```

### 4. **Token Expiration Handling**

```javascript
// Backend returns 401 → axios interceptor:
1. Removes auth_token from localStorage
2. Removes auth_user from localStorage
3. Calls setOnUnauthorized() callback
4. AuthContext.logout() is triggered
5. User redirected to /login
```

---

## 🎨 Using Material-UI Components

All pages use Material-UI v9 components for consistent design:

```javascript
import {
  Button,
  TextField,
  Card,
  Table,
  Dialog,
  Chip,
  Alert,
  // ... more components
} from '@mui/material';
```

---

## 📱 API Integration

### Login API Call
```javascript
POST /api/auth/login
{
  "username": "user123",
  "password": "password"
}

Response:
{
  "success": true,
  "data": {
    "token": "...",
    "username": "user123",
    "roles": ["ROLE_USER"],
    "permissions": [...]
  }
}
```

### Users List
```javascript
GET /api/users
(Requires: USER_READ permission)

Response: List of all users with roles
```

### Assign Role
```javascript
POST /api/users/{userId}/roles
{
  "roleNames": ["ROLE_ADMIN"]
}
(Requires: ROLE_ASSIGN permission)
```

### Get Roles
```javascript
GET /api/roles
(Requires: ROLE_READ permission)

Response: List of all roles with permissions
```

### Create Role
```javascript
POST /api/roles
{
  "name": "ROLE_MANAGER",
  "description": "Manager role",
  "permissionCodes": ["USER_READ", "USER_UPDATE"]
}
(Requires: ROLE_CREATE permission)
```

---

## 🔒 Security Features

### 1. **Token Storage**
- JWT token stored in localStorage
- User data serialized as JSON
- No sensitive data in tokens (server-side validation)

### 2. **Request Interception**
- Every request includes JWT in Authorization header
- Backend validates token signature
- Invalid tokens return 401

### 3. **Error Handling**
- 401 errors trigger logout
- 403 errors show permission denied
- Network errors show retry option
- User-friendly error messages

### 4. **Route Protection**
- Protected routes check `isAuthenticated` flag
- Unauthenticated users redirected to login
- Loading state prevents jumping between pages

---

## 🧪 Testing Authentication

### Test Users (Create in Backend)

**Admin User:**
```
Username: admin
Password: password
Roles: ROLE_ADMIN
Permissions: All permissions
```

**Regular User:**
```
Username: user1
Password: password
Roles: ROLE_USER
Permissions: LIMITED_READ permissions
```

### Test Flows

1. **Login with correct credentials** → Should redirect to home
2. **Login with wrong credentials** → Should show error message
3. **Try accessing /users without permission** → Should show error or restricted UI
4. **Let token expire** → Should auto-logout
5. **Refresh page while logged in** → Should restore session
6. **Logout** → Should clear all storage and redirect to login

---

## 🚨 Troubleshooting

### Issue: "useAuth must be inside AuthProvider"
**Solution:** Ensure App.jsx wraps children in `<AuthProvider>`

### Issue: CORS errors
**Solution:** Check backend SecurityConfig CORS settings (should allow localhost:5173)

### Issue: 401 errors on all requests
**Solution:** 
- Check if JWT token is in localStorage
- Verify token hasn't expired
- Check if backend JWT_SECRET matches

### Issue: Roles/Permissions not loading
**Solution:**
- Verify user has required permissions
- Check backend @PreAuthorize annotations
- Ensure roles are assigned to user

---

## 📚 Dependencies

```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.14.2",
  "axios": "^1.15.2",
  "@mui/material": "^9.0.0",
  "@mui/icons-material": "^9.0.0",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

---

## 🎯 Next Steps

1. **Data Persistence**
   - Implement user profile page
   - Add profile edit functionality
   - Add password change feature

2. **Advanced Features**
   - Add refresh token mechanism
   - Implement role hierarchy
   - Add permission audit logs

3. **Performance**
   - Add request caching
   - Implement pagination for user/role lists
   - Add search and filtering

4. **Testing**
   - Add unit tests with Jest
   - Add E2E tests with Cypress
   - Test all authentication flows

---

## 📖 Related Documentation

- **Backend RBAC**: See `/Users/srinivasranjan/udyaman/README_PRODUCTION_SETUP.md`
- **API Reference**: See `/Users/srinivasranjan/udyaman/API_DOCUMENTATION.md`
- **PostgreSQL Migration**: See `/Users/srinivasranjan/udyaman/POSTGRESQL_MIGRATION.md`

---

## 🔗 Useful Links

- **React Router Docs**: https://reactrouter.com/
- **Material-UI Docs**: https://mui.com/
- **Axios Docs**: https://axios-http.com/
- **JWT Introduction**: https://jwt.io/introduction

---

**Created**: May 1, 2026
**Version**: 1.0.0
**Status**: ✅ Complete

