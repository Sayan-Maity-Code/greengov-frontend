# Permission-Based UI Architecture Guide

## Overview

All authenticated users can access ALL pages via the sidebar. Inside each page, specific UI elements and actions are conditionally rendered based on user authority/role using two reusable components: `ActionButton` and `ContentGate`.

**View is always enabled. Edit/Create/Delete are gated by authority/role.**

## Permission System (3 Files)

| File | Purpose |
|------|---------|
| `hooks/usePermission.js` | Core hook — provides `hasRole()`, `hasAuthority()`, etc. |
| `components/ActionButton.jsx` | Permission-gated button — hides if user lacks permission |
| `components/ContentGate.jsx` | Permission-gated content section — hides children if no permission |

## Usage Examples

### ActionButton — For action elements (buttons, links)

```jsx
// Only PROGRAM_MANAGER sees this button
<ActionButton
    authority="PROGRAM_MANAGER"
    onClick={handleCreate}
    className="btn btn-success"
>
    Create Program
</ActionButton>

// No permission required — visible to all
<ActionButton onClick={() => viewDetails()}>
    View Details
</ActionButton>

// Multiple authorities (OR logic)
<ActionButton
    authorities={["PROGRAM_MANAGER", "ADMIN"]}
    onClick={handleDelete}
    className="btn btn-danger"
>
    Delete
</ActionButton>
```

### ContentGate — For content sections (forms, panels, cards)

```jsx
// Only PROGRAM_MANAGER sees the create form
<ContentGate authority="PROGRAM_MANAGER">
    <CreateProgramForm />
</ContentGate>

// Only CITIZEN or BUSINESS_OWNER sees this
<ContentGate roles={["CITIZEN", "BUSINESS_OWNER"]}>
    <ApplicationForm />
</ContentGate>

// With fallback message for unauthorized users
<ContentGate
    authority="ADMIN"
    fallback={<p className="text-muted">Admin access required</p>}
>
    <AdminPanel />
</ContentGate>
```

## ActionButton Props

| Prop | Type | Description |
|------|------|-------------|
| `authority` | string | Single authority required (e.g., "PROGRAM_MANAGER") |
| `authorities` | array | Multiple authorities (OR by default) |
| `role` | string | Single role required |
| `roles` | array | Multiple roles |
| `requireAll` | boolean | If true, user must have ALL authorities/roles |
| `onClick` | function | Click handler |
| `className` | string | Button CSS classes |
| `disabled` | boolean | Disable button |
| `fallback` | ReactNode | Content to show if no permission |

## ContentGate Props

| Prop | Type | Description |
|------|------|-------------|
| `authority` | string | Single authority required |
| `authorities` | array | Multiple authorities (OR by default) |
| `role` | string | Single role required |
| `roles` | array | Multiple roles |
| `requireAll` | boolean | If true, user must have ALL authorities/roles |
| `fallback` | ReactNode | Content to show if no permission |
| `children` | ReactNode | Content to render if permission granted |

## Permission Map (per Page)

| Page | View | Create | Update/Edit | Delete |
|------|------|--------|-------------|--------|
| Programs | Everyone | `PROGRAM_MANAGER` | `PROGRAM_MANAGER` (status) | — |
| Applications | Everyone | `CITIZEN`/`BUSINESS_OWNER` | `PROGRAM_MANAGER` (approve/reject) | — |
| Projects | Everyone | `CITIZEN`/`BUSINESS_OWNER` | `PROGRAM_MANAGER` (status) | — |
| Compliance | Everyone | `COMPLIANCE_OFFICER` | — | — |
| Audit | Everyone | `AUDIT_MANAGER` | `AUDIT_MANAGER` (close) | — |
| Incentives | Everyone | `DISBURSEMENT_OFFICER` | — | `DISBURSEMENT_OFFICER` |
| Resources | Everyone | `PROGRAM_MANAGER` | `PROGRAM_MANAGER` | `PROGRAM_MANAGER` |
| Officers | Everyone | — | `ADMIN` (approve/reject) | — |

## Authority/Role Reference

### Authorities (from backend)
- `ADMIN` — System administrator
- `PROGRAM_MANAGER` — Can create and manage programs
- `COMPLIANCE_OFFICER` — Can create compliance records
- `AUDIT_MANAGER` — Can initiate and manage audits
- `DISBURSEMENT_OFFICER` — Can process incentives

### Roles (from backend PrimaryRole)
- `CITIZEN` — Regular citizen user
- `BUSINESS_OWNER` — Business entity
- `OFFICER` — Government officer

## Best Practices

1. **Never block page access** — All pages visible to all authenticated users
2. **Use ActionButton for actions** — Buttons for create/edit/delete operations
3. **Use ContentGate for sections** — Forms, panels, cards that should be hidden
4. **Provide fallback** — Use `fallback` prop to show info messages to unauthorized users
5. **Keep it simple** — Use single authority checks when possible
6. **Backend enforces security** — Frontend gating is UX only; backend rejects unauthorized requests

## Backend Endpoint Security

```java
// Programs - Everyone can view
.requestMatchers(HttpMethod.GET, "/api/programs/**").permitAll()

// Programs - Only PROGRAM_MANAGER can create
.requestMatchers(HttpMethod.POST, "/api/programs/**")
.hasAuthority("PROGRAM_MANAGER")

// Programs - Only PROGRAM_MANAGER can update/delete
.requestMatchers(HttpMethod.PUT, "/api/programs/**")
.hasAuthority("PROGRAM_MANAGER")
.requestMatchers(HttpMethod.DELETE, "/api/programs/**")
.hasAuthority("PROGRAM_MANAGER")
```

The frontend mirrors this — buttons for create/update/delete are hidden, but even if someone tries to bypass them, the backend will reject the request.
