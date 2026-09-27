# 🔐 Role-Based Routing & Access Control Guide

Complete guide to implementing role-based routing and access control in the React ERP application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Roles & Permissions](#roles--permissions)
3. [Core Components](#core-components)
4. [Implementation Guide](#implementation-guide)
5. [Code Examples](#code-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Role-Based Access Control (RBAC)?

Role-Based Access Control is a security model that restricts access based on user's assigned roles. Each role has specific permissions.

```
User → Role → Permissions → Resources
```

### Architecture

```
┌─────────────────────────────────────────┐
│   React Application                      │
├─────────────────────────────────────────┤
│  1. AuthContext                         │
│     - Stores user & roles               │
├─────────────────────────────────────────┤
│  2. RBAC Utilities (rbac.js)           │
│     - Role & permission checks          │
├─────────────────────────────────────────┤
│  3. Components                          │
│     - ProtectedRoute (route-level)      │
│     - RoleGate (component-level)        │
│     - PermissionGate (permission-level) │
├─────────────────────────────────────────┤
│  4. Navbar & App.jsx                    │
│     - Role-based rendering              │
└─────────────────────────────────────────┘
```

---

## Roles & Permissions

### Three Tier Role System

#### 1. SUPER_ADMIN
- **Level**: 3 (Highest)
- **Access**: Complete system access
- **Permissions**: All permissions
- **Responsibilities**: System configuration, user management, tenant management

```javascript
const superAdminPerms = [
  'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
  'ROLE_READ', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_ASSIGN',
  'ADMIN_PANEL', 'SYSTEM_CONFIG', 'AUDIT_LOGS',
  'VIEW_REPORTS', 'EXPORT_DATA'
];
```

#### 2. TENANT_ADMIN
- **Level**: 2 (Middle)
- **Access**: Tenant-specific management
- **Permissions**: User and role management within tenant
- **Responsibilities**: Manage users, assign roles, view reports

```javascript
const tenantAdminPerms = [
  'USER_READ', 'USER_CREATE', 'USER_UPDATE',
  'ROLE_READ', 'ROLE_ASSIGN',
  'ADMIN_PANEL',
  'VIEW_REPORTS', 'EXPORT_DATA'
];
```

#### 3. STAFF
- **Level**: 1 (Lowest)
- **Access**: Read-only access
- **Permissions**: Limited read and view permissions
- **Responsibilities**: View data, generate reports

```javascript
const staffPerms = [
  'USER_READ', 'ROLE_READ', 'VIEW_REPORTS'
];
```

### Permissions List

```javascript
{
  // User Management
  USER_READ,      // View users
  USER_CREATE,    // Create new users
  USER_UPDATE,    // Edit users
  USER_DELETE,    // Delete users

  // Role Management
  ROLE_READ,      // View roles
  ROLE_CREATE,    // Create roles
  ROLE_UPDATE,    // Edit roles
  ROLE_DELETE,    // Delete roles
  ROLE_ASSIGN,    // Assign roles to users

  // Admin Operations
  ADMIN_PANEL,    // Access admin panel
  SYSTEM_CONFIG,  // System configuration
  AUDIT_LOGS,     // View audit logs

  // Staff Operations
  VIEW_REPORTS,   // View reports
  EXPORT_DATA     // Export data
}
```

---

## Core Components

### 1. RBAC Utilities (`src/utils/rbac.js`)

Utility functions for role and permission checking.

#### Functions Available

```javascript
// ===== ROLE CHECKS =====

// Check if user has ANY required role
hasRole(userRoles, requiredRoles)

// Check if user has ALL required roles
hasAllRoles(userRoles, requiredRoles)

// Get role hierarchy level
getRoleLevel(role)  // Returns 1-3

// Get highest role level from array
getHighestRoleLevel(roles)

// Check if user's role >= required role level
hasHigherOrEqualRole(userRoles, requiredRole)

// ===== PERMISSION CHECKS =====

// Check if user has ANY required permission
hasPermission(userRoles, requiredPermissions)

// Check if user has ALL required permissions
hasAllPermissions(userRoles, requiredPermissions)

// Get all permissions for user's roles
getUserPermissions(userRoles)

// ===== FILTER OPERATIONS =====

// Filter items based on role
filterByRole(items, userRoles, allowedRoles)
```

### 2. ProtectedRoute Component

**File**: `src/components/ProtectedRoute.jsx`

Protects routes at the route level.

```jsx
<ProtectedRoute
  requiredRoles="SUPER_ADMIN"
  requiredPermissions="ADMIN_PANEL"
>
  <AdminPage />
</ProtectedRoute>
```

**Props**:
- `children` (required) - Component to render if authorized
- `requiredRoles` (optional) - Single role or array (ANY match allowed)
- `requiredAllRoles` (optional) - Single role or array (ALL must match)
- `requiredPermissions` (optional) - Single permission or array (ANY match allowed)

**Behavior**:
1. Shows loading spinner while checking auth
2. Redirects to login if not authenticated
3. Shows access denied page if role/permission missing
4. Renders children if all checks pass

### 3. RoleGate Component

**File**: `src/components/RoleGate.jsx`

Conditionally renders elements based on roles.

```jsx
<RoleGate requiredRoles="SUPER_ADMIN">
  <DeleteButton />
</RoleGate>
```

**Three Gate Components**:

#### RoleGate
```jsx
<RoleGate 
  requiredRoles="TENANT_ADMIN"
  fallback={null}
>
  {/* Shown only to TENANT_ADMIN or SUPER_ADMIN */}
</RoleGate>
```

#### PermissionGate
```jsx
<PermissionGate 
  requiredPermissions="USER_CREATE"
  fallback={<span>No permission</span>}
>
  {/* Shown only if user has USER_CREATE permission */}
</PermissionGate>
```

#### AccessGate (Combined)
```jsx
<AccessGate 
  requiredRoles="SUPER_ADMIN"
  requiredPermissions="ADMIN_PANEL"
  fallback={null}
>
  {/* Shown only if user has BOTH role AND permission */}
</AccessGate>
```

**Props**:
- `children` - Content to show if authorized
- `requiredRoles` - Role requirement
- `requiredPermissions` - Permission requirement
- `fallback` - Content to show if not authorized (default: null)

---

## Implementation Guide

### Step 1: Setup Roles for Users

Backend assigns roles during user creation. Roles come in JWT:

```javascript
{
  token: "eyJhbGc...",
  username: "john",
  roles: ["ROLE_ADMIN", "ROLE_STAFF"],
  permissions: ["USER_READ", "USER_CREATE", ...]
}
```

### Step 2: Check User Roles in Components

#### Option A: Using ProtectedRoute (Route Level)

```jsx
// App.jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={ROLES.SUPER_ADMIN}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

#### Option B: Using RoleGate (Component Level)

```jsx
// ProductList.jsx
function ProductList() {
  return (
    <div>
      <h2>Products</h2>
      
      {/* Delete button only for admins */}
      <RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
        <Button variant="contained" color="error">
          Delete All
        </Button>
      </RoleGate>
      
      {/* Export button for staff with permission */}
      <PermissionGate requiredPermissions={PERMISSIONS.EXPORT_DATA}>
        <Button variant="outlined">
          Export
        </Button>
      </PermissionGate>
    </div>
  );
}
```

#### Option C: Direct Permission Check via Hook

```jsx
// In any component
const { user } = useAuth();
const { hasRole, hasPermission } = useAuth();  // If added to hook

if (hasRole(user.roles, ROLES.SUPER_ADMIN)) {
  // Show admin controls
}
```

### Step 3: Role-Based Menu (Navbar)

Menu items render based on user's role:

```jsx
// Navbar.jsx
<RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
  <NavLink to="/users" label="Users" />
</RoleGate>

<RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
  <NavLink to="/admin" label="Admin Panel" />
</RoleGate>

<PermissionGate requiredPermissions={PERMISSIONS.VIEW_REPORTS}>
  <NavLink to="/reports" label="Reports" />
</PermissionGate>
```

---

## Code Examples

### Example 1: Role-Based Route Protection

```jsx
// App.jsx
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROLES } from './utils/rbac';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected - All authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected - Admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={ROLES.SUPER_ADMIN}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      
      {/* Protected - Admins with specific permission */}
      <Route
        path="/users"
        element={
          <ProtectedRoute
            requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}
            requiredPermissions={PERMISSIONS.USER_READ}
          >
            <UsersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Example 2: Conditional UI Rendering

```jsx
import { RoleGate, PermissionGate } from '../components/RoleGate';
import { ROLES, PERMISSIONS } from '../utils/rbac';

function UserCard({ user }) {
  return (
    <Card>
      <Typography variant="h6">{user.name}</Typography>
      
      {/* Edit button - Admins only */}
      <RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
        <Button variant="outlined">Edit</Button>
      </RoleGate>
      
      {/* Delete button - Super admin only */}
      <RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
        <Button variant="contained" color="error">Delete</Button>
      </RoleGate>
      
      {/* View details - All authenticated users */}
      <Button color="primary">View Details</Button>
    </Card>
  );
}
```

### Example 3: Permission-Based Features

```jsx
function ReportGenerator() {
  return (
    <div>
      {/* View button - Everyone with permission */}
      <PermissionGate requiredPermissions={PERMISSIONS.VIEW_REPORTS}>
        <Button>View Reports</Button>
      </PermissionGate>
      
      {/* Export button - Users with export permission */}
      <PermissionGate requiredPermissions={PERMISSIONS.EXPORT_DATA}>
        <Button>Export as PDF</Button>
      </PermissionGate>
      
      {/* Admin features */}
      <RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
        <Button>Advanced Filters</Button>
        <Button>Scheduled Reports</Button>
      </RoleGate>
    </div>
  );
}
```

### Example 4: Complex Role Checking

```jsx
import { 
  hasRole, 
  hasAllRoles, 
  hasHigherOrEqualRole,
  getRoleLevel 
} from '../utils/rbac';

function AnalyticsPage() {
  const { user } = useAuth();
  
  // Check any role
  if (hasRole(user.roles, [ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN])) {
    return <AdminAnalytics />;
  }
  
  // Check all roles
  if (hasAllRoles(user.roles, [ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN])) {
    return <SpecialAnalytics />;
  }
  
  // Check role hierarchy
  if (hasHigherOrEqualRole(user.roles, ROLES.TENANT_ADMIN)) {
    return <ManagerAnalytics />;
  }
  
  // Get role level
  const level = getRoleLevel(user.roles[0]);
  
  return <BasicAnalytics />;
}
```

---

## Best Practices

### 1. Always Use Role-Based Routing for Sensitive Pages

❌ **Bad**: No role checking
```jsx
<Route path="/admin" element={<AdminPage />} />
```

✅ **Good**: Protected by role
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={ROLES.SUPER_ADMIN}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### 2. Combine Role and Permission Checks

❌ **Bad**: Only checking role
```jsx
<ProtectedRoute requiredRoles={ROLES.ADMIN}>
  <DeleteButton />
</ProtectedRoute>
```

✅ **Good**: Checking both role and permission
```jsx
<ProtectedRoute
  requiredRoles={ROLES.SUPER_ADMIN}
  requiredPermissions={PERMISSIONS.USER_DELETE}
>
  <DeleteButton />
</ProtectedRoute>
```

### 3. Hide Unauthorized UI Elements

❌ **Bad**: Show button and let backend reject
```jsx
<Button>Delete User</Button>
```

✅ **Good**: Hide button if no permission
```jsx
<RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
  <Button>Delete User</Button>
</RoleGate>
```

### 4. Use Meaningful Fallback UI

❌ **Bad**: No fallback
```jsx
<PermissionGate requiredPermissions="VIEW_REPORTS">
  <ReportButton />
</PermissionGate>
```

✅ **Good**: With fallback message
```jsx
<PermissionGate 
  requiredPermissions="VIEW_REPORTS"
  fallback={<Tooltip title="You don't have permission to view reports" />}
>
  <ReportButton />
</PermissionGate>
```

### 5. Never Trust Frontend-Only Authorization

Always validate permissions on backend:

```jsx
// Frontend
<ProtectedRoute requiredRoles={ROLES.SUPER_ADMIN}>
  <DeleteAllButton />
</ProtectedRoute>

// Backend MUST also check:
@PreAuthorize("hasRole('SUPER_ADMIN')")
@DeleteMapping("/users")
public ResponseEntity deleteAll() {
  // This backend check is ESSENTIAL
}
```

---

## Troubleshooting

### Issue 1: Routes Not Restricting Access

**Problem**: User can access protected routes without proper role

**Solution**:
1. Check user.roles is populated correctly
2. Verify ProtectedRoute component is used
3. Check role names match exactly (case-sensitive)
4. Check AuthContext is properly initialized

```javascript
// Debug
const { user } = useAuth();
console.log('User roles:', user?.roles);
console.log('User permissions:', user?.permissions);
```

### Issue 2: UI Elements Showing When They Shouldn't

**Problem**: RoleGate/PermissionGate not hiding elements

**Solution**:
1. Check hasRole/hasPermission logic
2. Verify roles array is populated
3. Check role/permission names exactly match
4. Try without fallback first to test

```jsx
// Debug version
<RoleGate requiredRoles="SUPER_ADMIN" fallback={<div>DEBUG: No access</div>}>
  <SecretButton />
</RoleGate>
```

### Issue 3: Role-Based Menu Not Updating

**Problem**: Navbar doesn't show/hide items based on role

**Solution**:
1. Verify AuthContext user data updates
2. Check component re-renders on role change
3. Ensure RoleGate components are in Navbar
4. Test with hardcoded role first

```jsx
// Test with hardcoded role
<RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
  <NavLink to="/admin" label="Admin" />
</RoleGate>
```

### Issue 4: "Unauthorized" Page Too Strict

**Problem**: Users with permission still getting access denied

**Solution**:
1. Check you're using the correct role names
2. Verify user has at least ONE required role
3. Check role hierarchy is correct
4. Use multiple roles with array syntax

```jsx
// Wrong - requires both roles
<ProtectedRoute requiredAllRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>

// Right - requires at least one role
<ProtectedRoute requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
```

---

## Testing Role-Based Access

### Create Test Users with Different Roles

```javascript
// Backend - DataSeeder.java
User superAdmin = new User("admin", "admin@erp.com", "password");
superAdmin.addRole(superAdminRole);

User tenantAdmin = new User("manager", "manager@erp.com", "password");
tenantAdmin.addRole(tenantAdminRole);

User staff = new User("staff", "staff@erp.com", "password");
staff.addRole(staffRole);
```

### Test Matrix

| User Type | Can Access | Cannot Access |
|-----------|-----------|----------------|
| Super Admin | All pages, all features | Nothing restricted |
| Tenant Admin | Users, Roles, Reports | Admin Panel, System Config |
| Staff | Dashboard, Reports (read-only) | Create, Edit, Delete operations |

### Manual Testing Checklist

- [ ] Super Admin can access all pages
- [ ] Super Admin can perform all operations
- [ ] Tenant Admin sees Users and Roles menu
- [ ] Tenant Admin cannot access Admin Panel
- [ ] Staff only sees Dashboard and Reports
- [ ] Staff cannot see create/edit/delete buttons
- [ ] Unauthorized page appears when appropriate
- [ ] Menu items hide/show based on role
- [ ] Session persists role correctly on refresh

---

## References

- **RBAC Utilities**: `src/utils/rbac.js`
- **ProtectedRoute**: `src/components/ProtectedRoute.jsx`
- **RoleGate**: `src/components/RoleGate.jsx`
- **Route Config**: `src/config/routes.js`
- **Backend RBAC**: Backend README_PRODUCTION_SETUP.md

---

## Summary

### Key Concepts

1. **Three Roles**: SUPER_ADMIN > TENANT_ADMIN > STAFF
2. **Three Mechanisms**: ProtectedRoute (routes), RoleGate (components), useAuth (hooks)
3. **Defense in Depth**: Frontend hides UI, backend validates permissions
4. **Flexibility**: Check single role, multiple roles, or permissions

### Quick Implementation Steps

1. Import utilities and components
2. Wrap routes with ProtectedRoute
3. Wrap UI elements with RoleGate/PermissionGate
4. Update Navbar with role-based menu
5. Test with different user roles

### Remember

```
Frontend security is UX, not actual security.
Backend validation is ESSENTIAL.
Always check permissions on the server.
```

---

**Created**: May 1, 2026  
**Status**: ✅ Complete & Ready to Use


