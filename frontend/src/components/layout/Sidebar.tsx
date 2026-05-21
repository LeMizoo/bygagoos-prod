// frontend/src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Palette, 
  Bike, 
  UtensilsCrossed,
  Truck,
  Users,
  Settings,
  Crown,
  LogOut,
  Home,
  ShoppingBag,
  Image,
  UserCheck,
  Calendar,
  Table
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavSection {
  title: string;
  icon?: React.ElementType;
  items: NavItem[];
}

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const userRole = user?.role || "USER";

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "MANAGER";

  const navigation: NavSection[] = [
    {
      title: "Accueil",
      items: [
        { name: "Tableau de bord", href: "/home", icon: Home },
      ]
    },
    {
      title: "ByGagoos Ink",
      icon: Palette,
      items: [
        { name: "Dashboard", href: "/ink/dashboard", icon: LayoutDashboard },
        { name: "Commandes", href: "/admin/orders", icon: ShoppingBag, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        { name: "Designs", href: "/admin/designs", icon: Image, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        { name: "Clients", href: "/admin/clients", icon: Users, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
      ]
    },
    {
      title: "ByGagoos Trans",
      icon: Bike,
      items: [
        { name: "Dashboard", href: "/trans/dashboard", icon: LayoutDashboard },
        { name: "Véhicules", href: "/admin/taxi/vehicles", icon: Truck, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        { name: "Conducteurs", href: "/admin/taxi/drivers", icon: Users, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
      ]
    },
    {
      title: "ByGagoos CDA",
      icon: UtensilsCrossed,
      items: [
        { name: "Dashboard", href: "/cda/dashboard", icon: LayoutDashboard },
        { name: "Réservations", href: "/cda/dashboard", icon: Calendar, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        { name: "Tables", href: "/cda/dashboard", icon: Table, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
      ]
    },
    {
      title: "Administration",
      icon: Settings,
      items: [
        { name: "Staff", href: "/admin/staff", icon: UserCheck, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        { name: "Direction Générale", href: "/prod/dashboard", icon: Crown, roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        { name: "Paramètres", href: "/admin/settings", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
      ]
    }
  ];

  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.roles || item.roles.includes(userRole)
    )
  })).filter(section => section.items.length > 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link to="/home" className="flex items-center gap-2">
          <img src="/logo.svg" alt="ByGagoos" className="h-8 w-8" />
          <span className="text-xl font-bold">ByGagoos Prod</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredNavigation.map((section, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-4 mb-2 flex items-center gap-2">
              {section.icon && <section.icon className="h-4 w-4 text-gray-500" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== "/home" && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-amber-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
            <span className="text-sm font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}