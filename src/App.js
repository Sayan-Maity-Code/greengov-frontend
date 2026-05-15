import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProgramsPage from "./pages/ProgramsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import IncentivesPage from "./pages/IncentivesPage";
import CompliancePage from "./pages/CompliancePage";
import AuditPage from "./pages/AuditPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ResourcesPage from "./pages/ResourcesPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import SetupProfilePage from "./pages/SetupProfilePage";
import OfficersManagementPage from "./pages/OfficersManagementPage";
import EnvironmentalDashboard from './pages/EnvironmentalDashboard'; 

function App() {
  return (
    <Routes>
      {/* Home page - for unauthenticated users */}
      <Route path="/" element={<HomePage />} />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with MainLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup-profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SetupProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProgramsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ApplicationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/incentives"
        element={
          <ProtectedRoute 
            requiredAuthorities={["DISBURSEMENT_OFFICER", "COMPLIANCE_OFFICER"]}
            requiredRoles={["CITIZEN", "BUSINESS_OWNER"]}
          >
            <MainLayout>
              <IncentivesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/compliance"
        element={
          <ProtectedRoute requiredAuthority="COMPLIANCE_OFFICER">
            <MainLayout>
              <CompliancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute requiredAuthority="AUDIT_MANAGER">
            <MainLayout>
              <AuditPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredAuthorities={["ADMIN", "PROGRAM_MANAGER"]}>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources"
        element={
          <ProtectedRoute requiredAuthorities={["ADMIN", "PROGRAM_MANAGER"]}>
            <MainLayout>
              <ResourcesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />


      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/officers"
        element={
          <ProtectedRoute requiredAuthority="ADMIN">
            <MainLayout>
              <OfficersManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 🌿 THE MISSING ROUTE: Secure Officer Dashboard */}
      <Route
        path="/officer-dashboard"
        element={
          <ProtectedRoute requiredAuthority="ADMIN">
            <MainLayout>
              <EnvironmentalDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;