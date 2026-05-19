import { Link, useLocation } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";

export default function Sidebar() {
  const location = useLocation();
  const permission = usePermission();

  /**
   * Navigation configuration
   * - path: route path
   * - label: menu label
   * - authority / role: OPTIONAL access control
   */
  const NAV_ITEMS = [
    { path: "/dashboard", label: "Dashboard" },

    { path: "/programs", label: "Programs" },

    { path: "/projects", label: "Projects" },

    { path: "/applications", label: "Applications" },

    { path: "/incentives", label: "Incentives & Disbursements" },

    {
      path: "/compliance",
      label: "Compliance",
      authority: "COMPLIANCE_OFFICER",
    },

    {
      path: "/audit",
      label: "Audit",
      authority: "AUDIT_MANAGER",
    },

    {
      path: "/reports",
      label: "Reports & Analytics",
      authorities: ["ADMIN", "PROGRAM_MANAGER"],
    },

    {
      path: "/resources",
      label: "Resource & Infrastructure",
      authorities: ["ADMIN","PROGRAM_MANAGER"],
    },

    {
      path: "/officers",
      label: "Officers Management",
      authority: "ADMIN",
    },

    {
      path: "/officer-dashboard",
      label: "Verification Desk",
      authority: "ENVIRONMENT_OFFICER",
    },

    { path: "/profile", label: "My Profile" },
  ];

  /**
   * Permission filtering logic
   */
  const canShowItem = (item) => {
    // no restriction → always visible
    if (!item.authority && !item.role && !item.authorities && !item.roles) {
      return true;
    }

    if (item.authority) {
      return permission.hasAuthority(item.authority);
    }

    if (item.authorities) {
      return permission.hasAnyAuthority(item.authorities);
    }

    if (item.role) {
      return permission.hasRole(item.role);
    }

    if (item.roles) {
      return permission.hasAnyRole(item.roles);
    }

    return true;
  };

  return (
    <div
      className="bg-white border-end"
      style={{ width: 230, minHeight: "100%", flexShrink: 0 }}
    >
      <div className="p-3 border-bottom bg-success bg-opacity-10">
        <p className="mb-0 fw-semibold text-success small text-uppercase">
          Navigation
        </p>
      </div>

      <nav className="py-2">
        {NAV_ITEMS.filter(canShowItem).map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={
                "d-block px-3 py-2 text-decoration-none small " +
                (isActive
                  ? "bg-success text-white fw-semibold border-start border-3"
                  : "text-secondary border-start border-3")
              }
              style={{
                borderLeftColor: isActive ? "#198754" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
