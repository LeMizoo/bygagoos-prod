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
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const navigationGroups = [
  {
    title: "Pilotage",
    items: [
      { icon: Home, label: "Accueil", path: "/home" },
      { icon: Crown, label: "Direction Générale", path: "/prod/dashboard" },
      { icon: ShieldCheck, label: "Famille", path: "/admin/family" },
    ],
  },
  {
    title: "Activités",
    items: [
      { icon: Palette, label: "Ink Dashboard", path: "/ink/dashboard" },
      { icon: Bike, label: "Trans Dashboard", path: "/trans/dashboard" },
      { icon: UtensilsCrossed, label: "CDA Dashboard", path: "/cda/dashboard" },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: LayoutDashboard, label: "Centre admin", path: "/admin/dashboard" },
      { icon: Users, label: "Équipe", path: "/admin/staff" },
      { icon: Users, label: "Clients", path: "/admin/clients" },
      { icon: Package, label: "Designs", path: "/admin/designs" },
      { icon: ShoppingCart, label: "Commandes", path: "/admin/orders" },
      { icon: Bike, label: "Taxi-Moto", path: "/admin/taxi/vehicles" },
      { icon: Settings, label: "Paramètres", path: "/admin/settings" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <aside className="w-full bg-gray-900 text-white lg:sticky lg:top-0 lg:h-screen lg:w-72">
      <div className="flex h-full flex-col p-4 sm:p-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400">Navigation centralisée des activités</p>
        </div>

        <Link
          to="/home"
          className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-blue-600/20 px-4 py-3 transition-colors hover:bg-blue-600/30 lg:justify-start"
        >
          <Home size={20} />
          <span>Retour à l’accueil</span>
        </Link>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors lg:justify-start lg:text-base ${
                        isActive ? "bg-blue-600 text-white" : "bg-white/5 text-gray-200 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-6 flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-colors hover:bg-red-600/20 hover:text-red-300 lg:justify-start"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
