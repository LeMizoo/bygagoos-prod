import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Calendar,
  Table,
  Image,
  Box,
  LayoutGrid,
  Menu,
  X,
  FileText
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(true);
      } else {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fermer le menu mobile lors de la navigation
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

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
        { icon: FileText, label: "Rapports", path: "/admin/taxi/reports", color: "text-cyan-400", roles: ["ADMIN", "SUPER_ADMIN"] },
      ],
    },
    {
      title: "ByGagoos CDA",
      icon: UtensilsCrossed,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/cda/dashboard", color: "text-amber-400" },
        { icon: Calendar, label: "Réservations", path: "/cda/dashboard?tab=reservations", color: "text-amber-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: Table, label: "Tables", path: "/cda/dashboard?tab=tables", color: "text-amber-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: LayoutGrid, label: "Plan des tables", path: "/admin/restaurant/tables", color: "text-amber-400", roles: ["ADMIN", "SUPER_ADMIN"] },
        { icon: UtensilsCrossed, label: "Menu", path: "/menu", color: "text-amber-400" },
        { icon: Box, label: "Stock", path: "/admin/restaurant/stock", color: "text-amber-400", roles: ["ADMIN", "SUPER_ADMIN"] },
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
    const cleanPath = path.split('?')[0];
    if (cleanPath === "/home") return location.pathname === cleanPath;
    return location.pathname === cleanPath || location.pathname.startsWith(cleanPath);
  };

  const handleLogout = () => {
    logout();
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-800">
        <Link to="/home" className="flex items-center gap-2" onClick={() => isMobile && setIsMobileMenuOpen(false)}>
          <img src="/logo.svg" alt="ByGagoos" className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }} />
          <div>
            <h1 className="text-lg font-bold">ByGagoos Prod</h1>
            <p className="text-xs text-gray-500">Plateforme de gestion</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredGroups.map((group, idx) => (
          <div key={`${group.title}-${idx}`} className="mb-6">
            <div className="px-4 mb-2 flex items-center gap-2">
              {group.icon && <group.icon className="h-4 w-4 text-gray-500" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{group.title}</span>
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
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
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

      <div className="p-4 border-t border-gray-800">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-2 pb-3 border-b border-gray-800">
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-sm font-bold">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white shadow-lg hover:bg-gray-700 transition-colors md:hidden"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Sidebar pour desktop toujours visible */}
      {!isMobile && (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
          {sidebarContent}
        </div>
      )}

      {/* Sidebar overlay pour mobile */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-gray-900 text-white z-50 shadow-xl animate-in slide-in-from-left duration-300 md:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}