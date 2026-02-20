import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Redirection basée sur le rôle
  if (user?.role === "SUPER_ADMIN") {
    return <SuperAdminDashboard />;
  }

  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user?.role === "USER") {
    return <UserDashboard />;
  }

  // Redirection par défaut en cas de rôle non reconnu
  return <Navigate to="/unauthorized" replace />;
}
