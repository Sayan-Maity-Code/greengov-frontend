import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { usePermission } from "../hooks/usePermission";

const ALL_SERVICE_CARDS = [
  {
    title: "Officers Management",
    desc: "Verify and manage officer accounts. Approve or reject pending officer registrations.",
    path: "/officers",
    authority: "ADMIN",
  },
  {
    title: "Programs",
    desc: "Create and manage environmental programs. Track budget, status, and assigned managers.",
    path: "/programs",
  },
  {
    title: "Projects",
    desc: "View and manage sustainability projects. Review applications and project milestones.",
    path: "/projects",
  },
  {
    title: "Applications",
    desc: "Submit and track program applications. Manage application status and review outcomes.",
    path: "/applications",
  },
  {
    title: "Incentives & Disbursements",
    desc: "Process financial incentives for verified participants and track disbursement history.",
    path: "/incentives",
    authorities: ["DISBURSEMENT_OFFICER", "COMPLIANCE_OFFICER"],
  },
  {
    title: "Compliance Management",
    desc: "Create compliance records, run checks, and track adherence for projects and applications.",
    path: "/compliance",
    authority: "COMPLIANCE_OFFICER",
  },
  {
    title: "Audit Management",
    desc: "Initiate and manage audit processes based on compliance records.",
    path: "/audit",
    authority: "AUDIT_MANAGER",
  },
  {
    title: "Reports & Analytics",
    desc: "Generate operational reports and view system-wide environmental analytics.",
    path: "/reports",
    authorities: ["ADMIN", "PROGRAM_MANAGER"],
  },
  {
    title: "Resource & Infrastructure",
    desc: "Allocate resources, manage infrastructure assets, and update equipment status.",
    path: "/resources",
    authorities: ["ADMIN","PROGRAM_MANAGER"],
  },
];

export default function DashboardPage() {
  const navigate   = useNavigate();
  const permission = usePermission();
  const { getUsername, getRoles } = useAuth();

  const username = getUsername() || "User";
  const roles    = getRoles();

  /**
   * Permission checker (same idea as Sidebar)
   */
  const canShowCard = (card) => {
    if (!card.authority && !card.authorities && !card.role && !card.roles) {
      return true;
    }

    if (card.authority) {
      return permission.hasAuthority(card.authority);
    }

    if (card.authorities) {
      return permission.hasAnyAuthority(card.authorities);
    }

    if (card.role) {
      return permission.hasRole(card.role);
    }

    if (card.roles) {
      return permission.hasAnyRole(card.roles);
    }

    return true;
  };

  const visibleCards = ALL_SERVICE_CARDS.filter(canShowCard);

  const getRoleLabel = () => {
    if (permission.isAdmin()) return "Administrator";
    if (permission.isProgramManager()) return "Program Manager";
    if (permission.isComplianceOfficer()) return "Compliance Officer";
    if (permission.isAuditManager()) return "Audit Manager";
    if (permission.isDisbursementOfficer()) return "Disbursement Officer";
    if (roles.includes("CITIZEN")) return "Citizen";
    return "User";
  };

  const roleLabel = getRoleLabel();

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold mb-0 text-success">Dashboard</h4>
          <p className="text-muted small mb-0">
            Welcome back, <strong>{username}</strong> —{" "}
            <span className="text-success">{roleLabel}</span>
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="row g-4">
        {visibleCards.map((card) => (
          <div key={card.path} className="col-xl-3 col-lg-4 col-md-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ cursor: "pointer", transition: "box-shadow 0.15s ease" }}
              onClick={() => navigate(card.path)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 .5rem 1rem rgba(25,135,84,.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "")
              }
            >
              <div className="card-body p-4">
                <h6 className="fw-bold mb-2">{card.title}</h6>
                <p className="text-muted small mb-3">{card.desc}</p>
                <span className="text-success small fw-semibold">
                  Open &rarr;
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCards.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">
            No services available for your account role.
          </p>
        </div>
      )}
    </div>
  );
}