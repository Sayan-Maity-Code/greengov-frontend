# Permission-Based UI Control Guide

This guide explains how to control sidebar elements and components based on user roles and authorities in the GreenGov application.

---

## Quick Reference: Available Tools

You have **three main tools** for permission-based UI control:

1. **`usePermission` Hook** - For conditional logic in components
2. **`ContentGate` Component** - For wrapping UI sections/content
3. **`ActionButton` Component** - For conditional button rendering

---

## 1. Using `usePermission` Hook

The most flexible approach for permission checks. Use this when you need to:
- Make decisions in component logic
- Show/hide multiple elements with same condition
- Log/track permission-based actions

### Basic Usage

```jsx
import { usePermission } from "../hooks/usePermission";

export default function MyComponent() {
  const { isAdmin, isDisbursementOfficer, hasAuthority } = usePermission();

  // Check if user is admin
  if (isAdmin()) {
    return <AdminPanel />;
  }

  // Check if user is disbursement officer
  if (isDisbursementOfficer()) {
    return <DisbursementPanel />;
  }

  return <p>You don't have permission</p>;
}
```

### Available Methods in `usePermission()`

```javascript
const permission = usePermission();

// Single role/authority checks (preset methods - recommended)
permission.isAdmin()
permission.isProgramManager()
permission.isComplianceOfficer()
permission.isAuditManager()
permission.isDisbursementOfficer()
permission.isCitizenOrBusiness()

// Generic single checks
permission.hasRole("ADMIN")
permission.hasAuthority("PROGRAM_MANAGER")

// Multiple checks (AND logic)
permission.hasAllRoles(["ADMIN", "PROGRAM_MANAGER"])
permission.hasAllAuthorities(["ADMIN", "PROGRAM_MANAGER"])

// Multiple checks (OR logic)
permission.hasAnyRole(["CITIZEN", "BUSINESS_OWNER"])
permission.hasAnyAuthority(["PROGRAM_MANAGER", "AUDIT_MANAGER"])

// Get current user's roles and authorities
permission.getRoles()        // e.g., ["CITIZEN"]
permission.getAuthorities()  // e.g., ["PROGRAM_MANAGER", "ADMIN"]
```

### Example: Complex Conditional Logic

```jsx
import { usePermission } from "../hooks/usePermission";

export default function ApplicationsPage() {
  const { hasAuthority, hasAnyAuthority } = usePermission();

  return (
    <div>
      {/* Show create button only to CITIZEN and BUSINESS_OWNER */}
      {hasAnyAuthority(["CITIZEN", "BUSINESS_OWNER"]) && (
        <button className="btn btn-success">Submit Application</button>
      )}

      {/* Show approve/reject only to PROGRAM_MANAGER */}
      {hasAuthority("PROGRAM_MANAGER") && (
        <div>
          <button className="btn btn-primary">Approve</button>
          <button className="btn btn-danger">Reject</button>
        </div>
      )}

      {/* Show all applications to everyone */}
      <ApplicationsTable />
    </div>
  );
}
```

---

## 2. Using `ContentGate` Component

Use this to wrap entire sections or cards that should only show to specific users.

**Best for:** Hiding large blocks of UI

### Basic Usage

```jsx
import ContentGate from "../components/ContentGate";

export default function Dashboard() {
  return (
    <div>
      {/* Show to everyone */}
      <h1>Dashboard</h1>

      {/* Show only to PROGRAM_MANAGER */}
      <ContentGate authority="PROGRAM_MANAGER">
        <div className="card">
          <h2>Program Management</h2>
          <p>Manage programs here...</p>
        </div>
      </ContentGate>

      {/* Show only to ADMIN */}
      <ContentGate authority="ADMIN">
        <div className="card">
          <h2>Admin Settings</h2>
          <p>Admin configuration here...</p>
        </div>
      </ContentGate>
    </div>
  );
}
```

### ContentGate Props

```jsx
// Single authority check (AND logic)
<ContentGate authority="PROGRAM_MANAGER">
  <Content />
</ContentGate>

// Single role check
<ContentGate role="ADMIN">
  <Content />
</ContentGate>

// Multiple authorities (OR logic by default)
<ContentGate authorities={["PROGRAM_MANAGER", "AUDIT_MANAGER"]}>
  <Content />
</ContentGate>

// Multiple authorities (AND logic)
<ContentGate authorities={["ADMIN", "PROGRAM_MANAGER"]} requireAll={true}>
  <Content />
</ContentGate>

// Fallback UI when user doesn't have permission
<ContentGate authority="ADMIN" fallback={<p>Not authorized</p>}>
  <Content />
</ContentGate>
```

### Real Example: Dashboard Service Cards

```jsx
import ContentGate from "../components/ContentGate";

export default function Dashboard() {
  return (
    <div className="row g-4">
      {/* Always show to everyone */}
      <div className="col-md-6">
        <ContentGate>
          <ServiceCard title="Programs" />
        </ContentGate>
      </div>

      {/* Show only to ADMIN */}
      <div className="col-md-6">
        <ContentGate 
          authority="ADMIN"
          fallback={<div className="col-md-6"></div>}
        >
          <ServiceCard title="Officers Management" />
        </ContentGate>
      </div>

      {/* Show to multiple roles */}
      <div className="col-md-6">
        <ContentGate 
          authorities={["COMPLIANCE_OFFICER", "AUDIT_MANAGER"]}
        >
          <ServiceCard title="Audit" />
        </ContentGate>
      </div>
    </div>
  );
}
```

---

## 3. Using `ActionButton` Component

Use for buttons that should be conditionally shown/disabled based on permissions.

**Best for:** Action buttons (Create, Edit, Delete, etc.)

### Basic Usage

```jsx
import { ActionButton } from "../components/ActionButton";

export default function ProgramsPage() {
  return (
    <div>
      {/* Only show to PROGRAM_MANAGER */}
      <ActionButton
        authority="PROGRAM_MANAGER"
        onClick={handleCreate}
        className="btn btn-success"
      >
        Create Program
      </ActionButton>

      {/* Show to CITIZEN or BUSINESS_OWNER */}
      <ActionButton
        authorities={["CITIZEN", "BUSINESS_OWNER"]}
        onClick={handleSubmit}
        variant="primary"
      >
        Submit Application
      </ActionButton>

      {/* Show nothing if user doesn't have permission */}
      <ActionButton
        authority="ADMIN"
        onClick={handleDelete}
        variant="danger"
        fallback={null}
      >
        Delete Program
      </ActionButton>
    </div>
  );
}
```

### ActionButton Props

```jsx
// Authority check
<ActionButton authority="PROGRAM_MANAGER" onClick={handleClick}>
  Create
</ActionButton>

// Role check
<ActionButton role="ADMIN" onClick={handleClick}>
  Admin Action
</ActionButton>

// Multiple authorities (OR by default, AND with requireAll)
<ActionButton 
  authorities={["PROGRAM_MANAGER", "AUDIT_MANAGER"]}
  onClick={handleClick}
>
  Create
</ActionButton>

// Custom styling
<ActionButton 
  authority="DISBURSEMENT_OFFICER"
  onClick={handleClick}
  className="btn btn-lg btn-success"
  variant="success"  // Used if className not provided
>
  Disburse
</ActionButton>

// Disabled state
<ActionButton 
  authority="PROGRAM_MANAGER"
  onClick={handleClick}
  disabled={!selectedProgram}
>
  Edit
</ActionButton>

// Fallback (show different button if not authorized)
<ActionButton 
  authority="ADMIN"
  onClick={handleDelete}
  fallback={<button disabled>Not Authorized</button>}
>
  Delete
</ActionButton>
```

---

## 4. Controlling Sidebar Elements

To show/hide sidebar items based on user role:

### In `Sidebar.jsx`

```jsx
import { usePermission } from "../hooks/usePermission";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/programs", label: "Programs" },
  { path: "/officers", label: "Officers Management", adminOnly: true },
  { path: "/profile", label: "My Profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const { isAdmin } = usePermission();

  return (
    <nav className="py-2">
      {NAV_ITEMS.map((item) => {
        // Skip admin-only items if user is not admin
        if (item.adminOnly && !isAdmin()) {
          return null;
        }

        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Alternative: Using ContentGate for Sidebar

```jsx
import ContentGate from "../components/ContentGate";

export default function Sidebar() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/programs">Programs</Link>
      
      {/* Officers Management - only for ADMIN */}
      <ContentGate authority="ADMIN">
        <Link to="/officers">Officers Management</Link>
      </ContentGate>

      <Link to="/profile">My Profile</Link>
    </nav>
  );
}
```

---

## Permission Map (Per Page)

Use this table to understand what permissions are needed for each page:

| Page | View | Create | Update/Edit | Delete |
|------|------|--------|-------------|--------|
| Programs | Everyone | `PROGRAM_MANAGER` | `PROGRAM_MANAGER` (status) | `PROGRAM_MANAGER` |
| Applications | Everyone | `CITIZEN`/`BUSINESS_OWNER` | `PROGRAM_MANAGER` (approve/reject) | no functionality |
| Projects | Everyone | `CITIZEN`/`BUSINESS_OWNER` | `PROGRAM_MANAGER` (status) | no functionality |
| Compliance | Everyone | `COMPLIANCE_OFFICER` | `COMPLIANCE_OFFICER` | no functionality |
| Audit | Everyone | `AUDIT_MANAGER` | `AUDIT_MANAGER` (close) | no functionality |
| Incentives | Everyone | `DISBURSEMENT_OFFICER` | `DISBURSEMENT_OFFICER` | `DISBURSEMENT_OFFICER` |
| Resources | Everyone | `PROGRAM_MANAGER` | `PROGRAM_MANAGER` | `PROGRAM_MANAGER` |
| Officers | Everyone | — | `ADMIN` (approve/reject) | no functionality |

---

## Implementation Examples by Page

### Programs Page

```jsx
import ContentGate from "../components/ContentGate";
import { ActionButton } from "../components/ActionButton";
import { usePermission } from "../hooks/usePermission";

export default function ProgramsPage() {
  const { hasAuthority } = usePermission();
  const [programs, setPrograms] = useState([]);

  return (
    <div>
      <h1>Programs</h1>

      {/* Create button - only for PROGRAM_MANAGER */}
      <ActionButton
        authority="PROGRAM_MANAGER"
        onClick={handleCreate}
        className="btn btn-success"
      >
        Create Program
      </ActionButton>

      {/* Display programs table - visible to everyone */}
      <table>
        <tbody>
          {programs.map(program => (
            <tr key={program.id}>
              <td>{program.name}</td>

              {/* Edit button - only for PROGRAM_MANAGER */}
              <ContentGate authority="PROGRAM_MANAGER">
                <button onClick={() => handleEdit(program.id)}>Edit</button>
              </ContentGate>

              {/* Delete button - only for PROGRAM_MANAGER */}
              <ContentGate authority="PROGRAM_MANAGER">
                <button onClick={() => handleDelete(program.id)}>Delete</button>
              </ContentGate>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Incentives Page

```jsx
import { ActionButton } from "../components/ActionButton";
import ContentGate from "../components/ContentGate";

export default function IncentivesPage() {
  const [incentives, setIncentives] = useState([]);

  return (
    <div>
      <h1>Incentives & Disbursements</h1>

      {/* Create - only DISBURSEMENT_OFFICER */}
      <ActionButton
        authority="DISBURSEMENT_OFFICER"
        onClick={handleCreate}
        variant="success"
      >
        Create Incentive
      </ActionButton>

      {/* Disbursement section - only DISBURSEMENT_OFFICER */}
      <ContentGate authority="DISBURSEMENT_OFFICER">
        <div className="card">
          <h3>Disbursements</h3>
          {/* Disbursement UI here */}
        </div>
      </ContentGate>

      {/* Everyone can view */}
      <table>
        <tbody>
          {incentives.map(inc => (
            <tr key={inc.id}>
              <td>{inc.amount}</td>
              <td>{inc.status}</td>

              {/* Delete - only DISBURSEMENT_OFFICER */}
              <ContentGate authority="DISBURSEMENT_OFFICER">
                <button onClick={() => handleDelete(inc.id)}>Delete</button>
              </ContentGate>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Applications Page (with Multiple Roles)

```jsx
import { usePermission } from "../hooks/usePermission";
import ContentGate from "../components/ContentGate";
import { ActionButton } from "../components/ActionButton";

export default function ApplicationsPage() {
  const { hasAnyAuthority } = usePermission();
  const [applications, setApplications] = useState([]);

  return (
    <div>
      <h1>Applications</h1>

      {/* Submit - only CITIZEN or BUSINESS_OWNER */}
      <ActionButton
        authorities={["CITIZEN", "BUSINESS_OWNER"]}
        onClick={handleSubmit}
        variant="success"
      >
        Submit Application
      </ActionButton>

      {/* Display applications - everyone */}
      <table>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td>{app.title}</td>
              <td>{app.status}</td>

              {/* Approve/Reject - only PROGRAM_MANAGER */}
              <ContentGate authority="PROGRAM_MANAGER">
                <button onClick={() => handleApprove(app.id)}>Approve</button>
                <button onClick={() => handleReject(app.id)}>Reject</button>
              </ContentGate>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Key Takeaways

1. **Always use `ContentGate` or `ActionButton`** for permission checks in UI
2. **Use `usePermission` hook** for complex logic or state-based decisions
3. **Filter at the page level** (like Dashboard) to avoid rendering unnecessary cards
4. **Mark restricted items** in sidebar/navigation with `adminOnly: true` flag
5. **Provide fallback UI** when content is restricted (optional but recommended)
6. **Use preset methods** like `isAdmin()` instead of `hasAuthority("ADMIN")` when available
7. **Consider UX**: Hide rather than disable when user lacks permission (unless showing why they can't act)

---

## Quick Copy-Paste Templates

### Hide Entire Section

```jsx
<ContentGate authority="PROGRAM_MANAGER">
  <div className="card">
    <h3>Program Management</h3>
    {/* Content here */}
  </div>
</ContentGate>
```

### Conditional Button

```jsx
<ActionButton
  authority="PROGRAM_MANAGER"
  onClick={handleCreate}
  className="btn btn-success"
>
  Create Program
</ActionButton>
```

### Multiple Roles (OR logic)

```jsx
<ActionButton
  authorities={["CITIZEN", "BUSINESS_OWNER"]}
  onClick={handleSubmit}
  variant="primary"
>
  Submit
</ActionButton>
```

### Sidebar Navigation

```jsx
const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/officers", label: "Officers", adminOnly: true },
];

// In component:
{NAV_ITEMS.map((item) => {
  if (item.adminOnly && !isAdmin()) return null;
  return <Link key={item.path} to={item.path}>{item.label}</Link>;
})}
```
