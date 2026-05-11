import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Home,
  LogOut,
  Bike,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Équipe", path: "/admin/staff" },
  { icon: Users, label: "Clients", path: "/admin/clients" },
  { icon: Package, label: "Designs", path: "/admin/designs" },
  { icon: ShoppingCart, label: "Commandes", path: "/admin/orders" },
  { icon: Bike, label: "Taxi-Moto", path: "/admin/taxi/vehicles" },
  { icon: Settings, label: "Paramètres", path: "/admin/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-full lg:w-64 bg-gray-900 text-white lg:h-screen lg:sticky lg:top-0">
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 lg:mb-8">Admin Panel</h1>

        {/* Lien retour à l'accueil */}
        <Link
          to="/home"
          className="flex items-center justify-center lg:justify-start gap-3 px-4 py-3 mb-4 lg:mb-6 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
        >
          <Home size={20} />
          <span>Retour à l'accueil</span>
        </Link>

        {/* Navigation admin */}
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col lg:space-y-2 lg:gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-lg transition-colors text-sm lg:text-base ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center lg:justify-start gap-3 px-4 py-3 mt-6 lg:mt-8 w-full text-gray-300 hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
