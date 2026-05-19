import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { usePermission } from "../hooks/usePermission";


// Only for Environment Officer.
const OfficerRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const permission = usePermission();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!permission.hasAuthority("ENVIRONMENT_OFFICER")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default OfficerRoute;
