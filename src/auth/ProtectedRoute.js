import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../components/Loading";

/**
 * ProtectedRoute Component - Unified route protection
 * Handles both authentication checks and authority/role-based access
 * 
 * Usage:
 * - Basic authentication only:
 *   <ProtectedRoute><PageComponent /></ProtectedRoute>
 * 
 * - With single authority:
 *   <ProtectedRoute requiredAuthority="PROGRAM_MANAGER"><PageComponent /></ProtectedRoute>
 * 
 * - With multiple authorities (requires ANY one):
 *   <ProtectedRoute requiredAuthorities={["ADMIN", "PROGRAM_MANAGER"]}><PageComponent /></ProtectedRoute>
 * 
 * - With role-based access (requires ANY role):
 *   <ProtectedRoute requiredRole="CITIZEN"><PageComponent /></ProtectedRoute>
 * 
 * - With mixed authorities and roles (requires ANY from either list):
 *   <ProtectedRoute requiredAuthorities={["ADMIN"]} requiredRoles={["CITIZEN"]}><PageComponent /></ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requiredAuthority,
  requiredAuthorities,
  requiredRole,
  requiredRoles,
}) {
  const { isAuthenticated, isTokenExpired, getAuthorities, getRoles } = useAuth();

  // Still loading auth state
  if (!isAuthenticated && !isTokenExpired) {
    return <Loading />;
  }

  // Not authenticated or token expired - redirect to login
  if (!isAuthenticated || isTokenExpired) {
    return <Navigate to="/login" replace />;
  }

  // If no permissions are required, grant access
  const hasAnyRequirements = requiredAuthority || requiredAuthorities || requiredRole || requiredRoles;
  
  if (!hasAnyRequirements) {
    return children;
  }

  // Get current user's authorities and roles
  const authorities = getAuthorities();
  const roles = getRoles();

  // Check authorities (if required)
  let hasRequiredAuthority = false;
  if (requiredAuthority || requiredAuthorities) {
    const authoritiesToCheck = requiredAuthorities || [requiredAuthority];
    hasRequiredAuthority = authoritiesToCheck.some((auth) =>
      authorities.includes(auth)
    );
  }

  // Check roles (if required)
  let hasRequiredRole = false;
  if (requiredRole || requiredRoles) {
    const rolesToCheck = requiredRoles || [requiredRole];
    hasRequiredRole = rolesToCheck.some((role) => roles.includes(role));
  }

  // Determine access: If both are specified, need EITHER; if only one is specified, check that one
  let hasAccess = false;

  if ((requiredAuthority || requiredAuthorities) && (requiredRole || requiredRoles)) {
    // Both authorities and roles specified - user needs EITHER
    hasAccess = hasRequiredAuthority || hasRequiredRole;
  } else if (requiredAuthority || requiredAuthorities) {
    // Only authorities specified
    hasAccess = hasRequiredAuthority;
  } else if (requiredRole || requiredRoles) {
    // Only roles specified
    hasAccess = hasRequiredRole;
  }

  // If user doesn't have required access, redirect to not-found
  if (!hasAccess) {
    return <Navigate to="/not-found" replace />;
  }

  // All checks passed - render children
  return children;
}
