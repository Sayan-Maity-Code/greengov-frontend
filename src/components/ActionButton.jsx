import { usePermission } from "../hooks/usePermission";

/**
 * Reusable ActionButton Component
 * Conditionally renders a button based on role/authority requirements
 * 
 * Usage:
 * <ActionButton
 *   authority="PROGRAM_MANAGER"
 *   onClick={handleCreate}
 *   className="btn btn-success"
 *   icon={<PlusIcon />}
 * >
 *   Create Program
 * </ActionButton>
 * 
 * <ActionButton
 *   role="ADMIN"
 *   onClick={handleDelete}
 *   variant="danger"
 * >
 *   Delete
 * </ActionButton>
 */
export const ActionButton = ({
  children,
  onClick,
  authority,
  role,
  authorities,
  roles,
  requireAll = false,
  className = "",
  variant = "primary",
  icon = null,
  disabled = false,
  title = "",
  requireAny = false,
  fallback = null,
  ...props
}) => {
  const permission = usePermission();

  // Check if user has permission
  const hasPermission = () => {
    // If no permission requirement specified, always show
    if (!authority && !role && !authorities && !roles) {
      return true;
    }

    // Single authority check
    if (authority) {
      return permission.hasAuthority(authority);
    }

    // Single role check
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

  if (!hasPermission()) {
    return fallback;
  }

  const finalClassName = className || `btn btn-${variant}`;

  return (
    <button
      className={finalClassName}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {icon && <span className="me-2">{icon}</span>}
      {children}
    </button>
  );
};

export default ActionButton;
