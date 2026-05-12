import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ALL_SERVICE_CARDS = [
    {
        title: "Officers Management",
        desc: "Verify and manage officer accounts. Approve or reject pending officer registrations.",
        path: "/officers",
        requiredAuthority: "ADMIN",
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
    },
    {
        title: "Compliance Management",
        desc: "Create compliance records, run checks, and track adherence for projects and applications.",
        path: "/compliance",
    },
    {
        title: "Audit Management",
        desc: "Initiate and manage audit processes based on compliance records.",
        path: "/audit",
    },
    {
        title: "Reports & Analytics",
        desc: "Generate operational reports and view system-wide environmental analytics.",
        path: "/reports",
    },
    {
        title: "Resource & Infrastructure",
        desc: "Allocate resources, manage infrastructure assets, and update equipment status.",
        path: "/resources",
    },
];

export default function DashboardPage() {
    const navigate = useNavigate();
    const { getUsername, getAuthorities, getRoles } = useAuth();

    const username    = getUsername() || "User";
    const authorities = getAuthorities();
    const roles       = getRoles();
    const isProgramManager = authorities.includes("PROGRAM_MANAGER");

    // Filter cards based on user permissions
    const visibleCards = ALL_SERVICE_CARDS.filter(card => {
        // If card requires specific authority, check it
        if (card.requiredAuthority) {
            return authorities.includes(card.requiredAuthority);
        }
        // Otherwise show to everyone
        return true;
    });
    
    const getRoleLabel = () => {
        if (authorities.includes("ADMIN")) return "Administrator";
        if (isProgramManager) return "Program Manager";
        if (authorities.includes("COMPLIANCE_OFFICER")) return "Compliance Officer";
        if (authorities.includes("AUDIT_MANAGER")) return "Audit Manager";
        if (authorities.includes("DISBURSEMENT_OFFICER")) return "Disbursement Officer";
        if (roles.includes("CITIZEN")) return "Citizen";
        return "User";
    };
    const roleLabel = getRoleLabel();

    return (
        <div>
            {/* Page header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h4 className="fw-bold mb-0 text-success">Dashboard</h4>
                    <p className="text-muted small mb-0">
                        Welcome back, <strong>{username}</strong> &mdash; <span className="text-success">{roleLabel}</span>
                    </p>
                </div>
            </div>

            {/* Service cards */}
            <div className="row g-4">
                {visibleCards.map((card) => (
                    <div key={card.path} className="col-xl-3 col-lg-4 col-md-6">
                        <div
                            className="card border-0 shadow-sm h-100"
                            style={{ cursor: "pointer", transition: "box-shadow 0.15s ease" }}
                            onClick={() => navigate(card.path)}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(25,135,84,.15)"}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ""}
                        >
                            <div className="card-body p-4">
                                <div className="bg-success bg-opacity-10 rounded-2 mb-3 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: 40, height: 40 }}>
                                    <svg width="18" height="18" fill="#198754" viewBox="0 0 16 16">
                                        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                                    </svg>
                                </div>
                                <h6 className="fw-bold mb-2">{card.title}</h6>
                                <p className="text-muted small mb-3">{card.desc}</p>
                                <span className="text-success small fw-semibold">Open &rarr;</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {visibleCards.length === 0 && (
                <div className="text-center py-5">
                    <p className="text-muted">No services available for your account role.</p>
                </div>
            )}
        </div>
    );
}
