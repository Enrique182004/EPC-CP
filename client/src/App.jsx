import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DoctorsListPage from "./pages/DoctorsListPage.jsx";
import DoctorDetailPage from "./pages/DoctorDetailPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import WorkflowPage from "./pages/WorkflowPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import TdiPage from "./pages/TdiPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="doctors" element={<DoctorsListPage />} />
        <Route path="doctors/new" element={<DoctorDetailPage />} />
        <Route path="doctors/:id" element={<DoctorDetailPage />} />
        <Route path="doctors/:id/documents" element={<DocumentsPage />} />
        <Route path="doctors/:id/workflow" element={<WorkflowPage />} />
        <Route path="doctors/:id/tdi" element={<TdiPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute role="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
