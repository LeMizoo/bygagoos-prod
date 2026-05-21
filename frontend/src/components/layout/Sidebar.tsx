// frontend/src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  Bike,
  Crown,
  Home,
  LayoutDashboard,
  LogOut,
  Palette,
  Package,
  Settings,
  ShoppingCart,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Truck,
  UserCheck,
  Calendar,
  Table,
  Image,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  color?: string;
  roles?: string[];
}

interface NavGroup {
  title: string;
  icon?: React.ElementType;
  items: NavItem[];
}

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const userRole = user?.role || "USER";

  // Navigation avec chemins UNIQUES
  const navigationGroups: NavGroup[] = [
    {
      title: "Général",
      items: [
        { icon: Home, label: "Accueil", path: "/home", color: "text-gray-400" },
        { icon: Crown, label: "Direction Générale", path: "/prod/dashboard", color: "text-amber-500" },
      ],
    },
    {
      title: "ByGagoos Ink",
      icon: Palette,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/ink/dashboard", color: "text-purple-400" },
        { icon: ShoppingCart, label: "Commandes", path: "/admin/orders", color: "text-purple-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Package, label: "Designs", path: "/admin/designs", color: "text-purple-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Users, label: "Clients", path: "/admin/clients", color: "text-purple-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Image, label: "Galerie", path: "/gallery", color: "text-purple-400" },
      ],
    },
    {
      title: "ByGagoos Trans",
      icon: Bike,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/trans/dashboard", color: "text-cyan-400" },
        { icon: Truck, label: "Véhicules", path: "/admin/taxi/vehicles", color: "text-cyan-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Users, label: "Conducteurs", path: "/admin/taxi/drivers", color: "text-cyan-400", roles: ["ADMIN", "SUPER_ADMIN"] },
      ],
    },
    {
      title: "ByGagoos CDA",
      icon: UtensilsCrossed,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/cda/dashboard", color: "text-amber-400" },
        { icon: Calendar, label: "Réservations", path: "/cda/dashboard?tab=reservations", color: "text-amber-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Table, label: "Tables", path: "/cda/dashboard?tab=tables", color: "text-amber-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: UtensilsCrossed, label: "Menu", path: "/menu", color: "text-amber-400" },
      ],
    },
    {
      title: "Administration",
      icon: Settings,
      items: [
        { icon: Users, label: "Staff", path: "/admin/staff", color: "text-gray-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: ShieldCheck, label: "Famille", path: "/admin/family", color: "text-gray-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Settings, label: "Paramètres", path: "/admin/settings", color: "text-gray-400", roles: ["ADMIN", "SUPER_ADMIN"] },
      ],
    },
  ];

  const filteredGroups = navigationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(group => group.items.length > 0);

  const isActivePath = (path: string) => {
    // Ignorer les query params pour la comparaison
    const cleanPath = path.split('?')[0];
    if (cleanPath === "/home") return location.pathname === cleanPath;
    return location.pathname === cleanPath || location.pathname.startsWith(cleanPath);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link to="/home" className="flex items-center gap-2">
          <img src="/logo.svg" alt="ByGagoos" className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }} />
          <div>
            <h1 className="text-lg font-bold">ByGagoos Prod</h1>
            <p className="text-xs text-gray-500">Plateforme de gestion</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredGroups.map((group, idx) => (
          <div key={`${group.title}-${idx}`} className="mb-6">
            <div className="px-4 mb-2 flex items-center gap-2">
              {group.icon && <group.icon className="h-4 w-4 text-gray-500" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </span>
            </div>
            <div className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                const color = item.color || "text-gray-400";
                
                return (
                  <Link
                    key={`${item.path}-${itemIdx}`}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gray-800 text-white shadow-sm"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${!isActive ? color : "text-white"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-gray-800">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-2 pb-3 border-b border-gray-800">
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-sm font-bold">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}