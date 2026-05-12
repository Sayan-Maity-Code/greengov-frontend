import { usePermission } from "../hooks/usePermission";

/**
 * Reusable ContentGate Component
 * Conditionally renders content (sections, cards, etc) based on permissions
 * 
 * Usage:
 * <ContentGate authority="PROGRAM_MANAGER">
 *   <div>Program Manager only content</div>
 * </ContentGate>
 * 
 * <ContentGate roles={["COMPLIANCE_OFFICER", "AUDIT_MANAGER"]}>
 *   <div>Officer content</div>
 * </ContentGate>
 * 
 * <ContentGate authority="ADMIN" fallback={<p>Not authorized</p>}>
 *   <AdminPanel />
 * </ContentGate>
 */
export const ContentGate = ({
  children,
  authority,
  role,
  authorities,
  roles,
  requireAll = false,
  fallback = null,
}) => {
  const permission = usePermission();

  const hasPermission = () => {
    // If no permission requirement, always show
    if (!authority && !role && !authorities && !roles) {
      return true;
    }

    // Single authority
    if (authority) {
      return permission.hasAuthority(authority);
    }

    // Single role
    if (role) {
      return permission.hasRole(role);
    }

    // Multiple authorities
    if (authorities) {
      return requireAll
        ? permission.hasAllAuthorities(authorities)
        : permission.hasAnyAuthority(authorities);
    }

    // Multiple roles
    if (roles) {
      return requireAll
        ? permission.hasAllRoles(roles)
        : permission.hasAnyRole(roles);
    }

    return true;
  };

  return hasPermission() ? children : fallback;
};

export default ContentGate;
