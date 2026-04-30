import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useIdleTimeout } from "./hooks/useIdleTimeout"; // Ajout

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages publiques
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import DesignDetailPage from "./pages/DesignDetailPage";

// Pages Légales et Support
import { 
  PrivacyPage, 
  TermsPage, 
  CookiesPage, 
  ReturnsPage, 
  HelpCenterPage,
  FAQPage,
  CareersPage,
  PressPage
} from "./pages/legal/LegalPages";

// Pages d'authentification
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Pages admin
import DashboardPage from "./pages/admin/DashboardPage";
import AdminStaffPage from "./pages/admin/AdminStaffPage";
import StaffDetailPage from "./pages/admin/StaffDetailPage";
import EditStaffPage from "./pages/admin/EditStaffPage";
import CreateStaffPage from "./pages/admin/CreateStaffPage";
import DesignsPage from "./pages/admin/DesignsPage";
import CreateDesignPage from "./pages/admin/CreateDesignPage";
import EditDesignPage from "./pages/admin/EditDesignPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ClientsPage from "./pages/admin/ClientsPage";
import CreateClientPage from "./pages/admin/CreateClientPage";
import ClientDetailPage from "./pages/admin/ClientDetailPage";
import EditClientPage from "./pages/admin/EditClientPage";

// Pages commandes
import OrdersPage from "./pages/admin/OrdersPage";
import CreateOrderPage from "./pages/admin/CreateOrderPage";
import { OrderDetailsPage } from "./pages/admin/OrderDetailsPage";
import { EditOrderPage } from "./pages/admin/EditOrderPage";

// Pages utilisateur commandes
import { UserOrdersPage } from "./pages/user/UserOrdersPage";
import { UserOrderTrackingPage } from './pages/user/UserOrderTrackingPage';

// Pages utilisateur
import ProfilePage from "./pages/user/ProfilePage";
import MyOrdersPage from "./pages/user/MyOrdersPage";

// Pages d'erreur
import NotFoundPage from "./pages/errors/NotFoundPage";
import UnauthorizedPage from "./pages/errors/UnauthorizedPage";

// Composants de protection
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔁 Déconnexion automatique après 30 min d'inactivité
  useIdleTimeout(30);

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: {
            duration: 3000,
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />

        {/* ROUTES PUBLIQUES AVEC MAIN LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:designId" element={<DesignDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressPage />} />
        </Route>

        {/* ROUTES D'AUTHENTIFICATION */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* ROUTES ADMIN PROTÉGÉES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "MANAGER"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="staff">
            <Route index element={<AdminStaffPage />} />
            <Route path="create" element={<CreateStaffPage />} />
            <Route path=":id" element={<StaffDetailPage />} />
            <Route path="edit/:id" element={<EditStaffPage />} />
          </Route>
          <Route path="designs">
            <Route index element={<DesignsPage />} />
            <Route path="create" element={<CreateDesignPage />} />
            <Route path="edit/:id" element={<EditDesignPage />} />
          </Route>
          <Route path="orders">
            <Route index element={<OrdersPage />} />
            <Route path="create" element={<CreateOrderPage />} />
            <Route path=":id" element={<OrderDetailsPage />} />
            <Route path="edit/:id" element={<EditOrderPage />} />
          </Route>
          <Route path="clients">
            <Route index element={<ClientsPage />} />
            <Route path="create" element={<CreateClientPage />} />
            <Route path=":id" element={<ClientDetailPage />} />
            <Route path="edit/:id" element={<EditClientPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ROUTES UTILISATEUR PROTÉGÉES */}
        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRoles={["SUPER_ADMIN", "ADMIN", "STAFF", "CLIENT", "USER"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
          <Route path="orders" element={<UserOrdersPage />} />
          <Route path="orders/:id" element={<UserOrderTrackingPage />} />
        </Route>

        {/* ROUTES D'ERREUR */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;