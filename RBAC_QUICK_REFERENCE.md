# 🎯 Role-Based Routing - Quick Reference

Quick reference guide for implementing RBAC in React components and routes.

---

## 📚 Imports You'll Need

```javascript
import { ROLES, PERMISSIONS, hasRole, hasPermission } from '../utils/rbac';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleGate, PermissionGate, AccessGate } from '../components/RoleGate';
```

---

## 🔐 The Three Roles

| Role | Level | Use Case |
|------|-------|----------|
| `ROLES.SUPER_ADMIN` | 3 | System-wide access |
| `ROLES.TENANT_ADMIN` | 2 | Tenant management |
| `ROLES.STAFF` | 1 | Limited read access |

---

## 🛣️ Protecting Routes

### Protect All Routes
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Protect with Specific Role
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={ROLES.SUPER_ADMIN}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### Protect with Multiple Roles (ANY match)
```jsx
<Route
  path="/users"
  element={
    <ProtectedRoute
      requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}
    >
      <UsersPage />
    </ProtectedRoute>
  }
/>
```

### Protect with Permission
```jsx
<Route
  path="/reports"
  element={
    <ProtectedRoute requiredPermissions={PERMISSIONS.VIEW_REPORTS}>
      <ReportsPage />
    </ProtectedRoute>
  }
/>
```

### Protect with Role AND Permission
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute
      requiredRoles={ROLES.SUPER_ADMIN}
      requiredPermissions={PERMISSIONS.ADMIN_PANEL}
    >
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

---

## 🎨 Conditional UI Rendering

### Show/Hide Based on Role

```jsx
import { RoleGate } from '../components/RoleGate';

// Simple - Show content only for SUPER_ADMIN
<RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
  <DeleteButton />
</RoleGate>

// Multiple roles (ANY match)
<RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
  <EditButton />
</RoleGate>

// With fallback
<RoleGate 
  requiredRoles={ROLES.SUPER_ADMIN}
  fallback={<span>Admin only</span>}
>
  <AdminButton />
</RoleGate>
```

### Show/Hide Based on Permission

```jsx
import { PermissionGate } from '../components/RoleGate';

// Simple
<PermissionGate requiredPermissions={PERMISSIONS.USER_CREATE}>
  <CreateUserButton />
</PermissionGate>

// Multiple permissions (ANY match)
<PermissionGate 
  requiredPermissions={[PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE]}
>
  <ModifyButton />
</PermissionGate>

// With fallback
<PermissionGate 
  requiredPermissions={PERMISSIONS.DELETE_USER}
  fallback={<Tooltip title="No permission" />}
>
  <DeleteButton />
</PermissionGate>
```

### Show/Hide Based on Role AND Permission

```jsx
import { AccessGate } from '../components/RoleGate';

<AccessGate
  requiredRoles={ROLES.SUPER_ADMIN}
  requiredPermissions={PERMISSIONS.ADMIN_PANEL}
  fallback={null}
>
  <AdminControls />
</AccessGate>
```

---

## 🔍 Role/Permission Checking in Code

### Check if User Has Role

```javascript
const { user } = useAuth();

if (hasRole(user.roles, ROLES.SUPER_ADMIN)) {
  // User is super admin
}

if (hasRole(user.roles, [ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN])) {
  // User is admin of some kind
}
```

### Check if User Has Permission

```javascript
const { user } = useAuth();

if (hasPermission(user.roles, PERMISSIONS.USER_CREATE)) {
  // User can create users
}

if (hasPermission(user.roles, [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE])) {
  // User can create or update users
}
```

### Check if User Has All Permissions

```javascript
import { hasAllPermissions } from '../utils/rbac';

if (hasAllPermissions(user.roles, [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_DELETE])) {
  // User can do both, not just one
}
```

### Check Role Hierarchy

```javascript
import { hasHigherOrEqualRole, getRoleLevel } from '../utils/rbac';

// Check if user's role >= required role
if (hasHigherOrEqualRole(user.roles, ROLES.TENANT_ADMIN)) {
  // User is TENANT_ADMIN or SUPER_ADMIN
}

// Get role level (1, 2, or 3)
const level = getRoleLevel(user.roles[0]); // 3 for SUPER_ADMIN
```

---

## 📋 Permissions Reference

### User Management
```javascript
PERMISSIONS.USER_READ       // View users
PERMISSIONS.USER_CREATE     // Create users
PERMISSIONS.USER_UPDATE     // Edit users
PERMISSIONS.USER_DELETE     // Delete users
```

### Role Management
```javascript
PERMISSIONS.ROLE_READ       // View roles
PERMISSIONS.ROLE_CREATE     // Create roles
PERMISSIONS.ROLE_UPDATE     // Edit roles
PERMISSIONS.ROLE_DELETE     // Delete roles
PERMISSIONS.ROLE_ASSIGN     // Assign roles to users
```

### Admin Operations
```javascript
PERMISSIONS.ADMIN_PANEL     // Access admin panel
PERMISSIONS.SYSTEM_CONFIG   // System configuration
PERMISSIONS.AUDIT_LOGS      // View audit logs
```

### Staff Operations
```javascript
PERMISSIONS.VIEW_REPORTS    // View reports
PERMISSIONS.EXPORT_DATA     // Export data
```

---

## 🧩 Common Patterns

### Admin-Only Button

```jsx
<RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
  <Button variant="contained" color="error">
    Delete All
  </Button>
</RoleGate>
```

### Manager Menu Item

```jsx
<RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
  <MenuItem component={Link} to="/users">
    Manage Users
  </MenuItem>
</RoleGate>
```

### Staff Report Button

```jsx
<PermissionGate requiredPermissions={PERMISSIONS.VIEW_REPORTS}>
  <Button onClick={() => generateReport()}>
    Generate Report
  </Button>
</PermissionGate>
```

### Tiered Feature Access

```jsx
{/* Visible to everyone */}
<Button>Submit</Button>

{/* Visible to staff+ */}
<PermissionGate requiredPermissions={PERMISSIONS.VIEW_REPORTS}>
  <Button>View Reports</Button>
</PermissionGate>

{/* Visible to admins+ */}
<RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
  <Button>Manage Users</Button>
</RoleGate>

{/* Visible to super admin only */}
<RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
  <Button color="error">System Settings</Button>
</RoleGate>
```

---

## 📍 Real-World Examples

### User List Page

```jsx
function UsersPage() {
  return (
    <div>
      <h2>Users</h2>
      
      {/* Create button - Admins only */}
      <RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
        <Button variant="contained">Add User</Button>
      </RoleGate>
      
      <UserTable>
        {/* Edit button - Admins only */}
        <RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
          <TableCell><Button>Edit</Button></TableCell>
        </RoleGate>
        
        {/* Delete button - Super admin only */}
        <RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
          <TableCell><Button color="error">Delete</Button></TableCell>
        </RoleGate>
      </UserTable>
    </div>
  );
}
```

### Dashboard with Tiered Content

```jsx
function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      
      {/* All users see this */}
      <Card>
        <h3>My Tasks</h3>
        <TaskList />
      </Card>
      
      {/* Admins see this */}
      <RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
        <Card>
          <h3>Team Management</h3>
          <TeamStats />
        </Card>
      </RoleGate>
      
      {/* Super admin sees this */}
      <RoleGate requiredRoles={ROLES.SUPER_ADMIN}>
        <Card>
          <h3>System Health</h3>
          <SystemMetrics />
        </Card>
      </RoleGate>
    </div>
  );
}
```

---

## ⚙️ Configuration Files

### Add New Permission

**File**: `src/utils/rbac.js`

```javascript
// Step 1: Add to PERMISSIONS object
export const PERMISSIONS = {
  // ... existing
  NEW_FEATURE: 'NEW_FEATURE',
};

// Step 2: Add to rolePermissions mapping
const rolePermissions = {
  [ROLES.SUPER_ADMIN]: [
    // ... existing
    PERMISSIONS.NEW_FEATURE,
  ],
  [ROLES.TENANT_ADMIN]: [
    // ... existing (if applicable)
    PERMISSIONS.NEW_FEATURE,
  ],
  [ROLES.STAFF]: [
    // ... existing (if applicable)
  ],
};
```

### Add New Route

**File**: `src/App.jsx`

```javascript
// Add to routes
<Route
  path="/new-feature"
  element={
    <ProtectedRoute
      requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}
      requiredPermissions={PERMISSIONS.NEW_FEATURE}
    >
      <NewFeaturePage />
    </ProtectedRoute>
  }
/>
```

### Add to Navigation Menu

**File**: `src/components/Navbar.jsx`

```jsx
<RoleGate requiredRoles={[ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]}>
  <NavLink to="/new-feature" icon={<Icon />} label="New Feature" />
</RoleGate>
```

---

## 🐛 Debugging

### Check User Roles

```javascript
const { user } = useAuth();
console.log('Roles:', user?.roles);
console.log('Permissions:', user?.permissions);
```

### Test Role Function

```javascript
import { hasRole } from '../utils/rbac';

const userRoles = ['SUPER_ADMIN'];
console.log(hasRole(userRoles, ROLES.SUPER_ADMIN)); // true
console.log(hasRole(userRoles, ROLES.STAFF)); // false
```

### Verify ProtectedRoute

```jsx
// Add debug output
<ProtectedRoute requiredRoles={ROLES.SUPER_ADMIN}>
  {/* If you see this, you have access */}
  <AdminPanel />
</ProtectedRoute>
```

---

## ✅ Checklist for New Feature

- [ ] Define permissions needed in `rbac.js`
- [ ] Add permissions to role hierarchy in `rbac.js`
- [ ] Create route with `ProtectedRoute` in `App.jsx`
- [ ] Specify required roles/permissions in route
- [ ] Hide UI elements with `RoleGate`/`PermissionGate`
- [ ] Add navigation menu item with `RoleGate`
- [ ] Test with different user roles
- [ ] Verify backend also validates permissions

---

## 📖 Full Documentation

For complete guide with examples, see: **RBAC_ROUTING_GUIDE.md**

---

**Created**: May 1, 2026
**Status**: ✅ Ready to Use


