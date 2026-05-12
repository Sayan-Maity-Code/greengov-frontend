import { Link, useLocation } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { useState, useEffect } from "react";

export default function Sidebar() {
    const location = useLocation();
    const [isEnvOfficer, setIsEnvOfficer] = useState(false);
    const { isAdmin } = usePermission();
    // Crack open the token to check if they are the Environmental Officer
    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const authorities = payload.authorities || [];
                if (authorities.includes("ENVIRONMENT_OFFICER")) {
                    setIsEnvOfficer(true);
                }
            } catch (e) {
                console.error("Token decoding failed in Sidebar", e);
            }
        }
    }, []);

    // Build the navigation array dynamically
    const NAV_ITEMS = [
        { path: "/dashboard",    label: "Dashboard" },
        { path: "/programs",     label: "Programs" },
        { path: "/projects",     label: "Projects" },
        { path: "/applications", label: "Applications" },
        { path: "/incentives",   label: "Incentives & Disbursements" },
        { path: "/compliance",   label: "Compliance" },
        { path: "/audit",        label: "Audit" },
        { path: "/reports",      label: "Reports & Analytics" },
        { path: "/resources",    label: "Resource & Infrastructure" },
        { path: "/officers",     label: "Officers Management" },
        // ONLY inject this if they are an Environment Officer!
        ...(isEnvOfficer ? [{ path: "/officer-dashboard", label: "🛡️ Verification Desk" }] : []),
        { path: "/profile",      label: "My Profile" },
    ];


    return (
        <div className="bg-white border-end" style={{ width: 230, minHeight: "100%", flexShrink: 0 }}>
            <div className="p-3 border-bottom bg-success bg-opacity-10">
                <p className="mb-0 fw-semibold text-success small text-uppercase ls-wider">Navigation</p>
            </div>
            <nav className="py-2">
                {NAV_ITEMS.map((item) => {
                    // Skip admin-only items if user is not admin
                    if (item.adminOnly && !isAdmin()) {
                        return null;
                    }

                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={
                                "d-block px-3 py-2 text-decoration-none small " +
                                (isActive
                                    ? "bg-success text-white fw-semibold border-start border-3 border-white"
                                    : "text-secondary border-start border-3 border-white")
                            }
                            style={{
                                borderLeftColor: isActive ? "#198754" : "transparent",
                                borderLeftStyle: "solid",
                                transition: "all 0.15s ease"
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