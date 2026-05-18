import {
  Bike,
  Crown,
  Home,
  LayoutDashboard,
  Palette,
  Package,
  Settings,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { activityModules } from "./activities";

export interface DashboardAccessLink {
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  badge: string;
}

const buildActivityLink = (label: string, path: string, description: string, icon: LucideIcon, accent: string, badge: string): DashboardAccessLink => ({
  label,
  path,
  description,
  icon,
  accent,
  badge,
});

export const transversalDashboardLinks: DashboardAccessLink[] = [
  buildActivityLink(
    "Direction Générale",
    "/prod/dashboard",
    "Vue exécutive et gouvernance familiale",
    Crown,
    "from-amber-600 via-orange-500 to-amber-400",
    "Pilotage",
  ),
  ...activityModules.map((module) =>
    buildActivityLink(
      module.name,
      module.path,
      module.description,
      module.icon,
      module.accent,
      "Activité",
    ),
  ),
];

export const centralAdministrationLinks: DashboardAccessLink[] = [
  buildActivityLink(
    "Centre admin",
    "/admin/dashboard",
    "Statistiques, exports et pilotage transversal",
    LayoutDashboard,
    "from-slate-800 via-slate-700 to-gray-900",
    "Central",
  ),
  buildActivityLink(
    "Équipe",
    "/admin/staff",
    "Staff, rôles et accès",
    Users,
    "from-slate-700 via-slate-600 to-slate-800",
    "RH",
  ),
  buildActivityLink(
    "Clients",
    "/admin/clients",
    "Comptes, suivi et relation client",
    Users,
    "from-indigo-600 via-violet-600 to-purple-600",
    "CRM",
  ),
  buildActivityLink(
    "Designs",
    "/admin/designs",
    "Catalogue, création et publication",
    Package,
    "from-amber-600 via-orange-500 to-rose-500",
    "Catalogue",
  ),
  buildActivityLink(
    "Commandes",
    "/admin/orders",
    "Suivi de production et livraison",
    ShoppingCart,
    "from-emerald-600 via-teal-500 to-cyan-500",
    "Flux",
  ),
  buildActivityLink(
    "Taxi-Moto",
    "/admin/taxi/vehicles",
    "Flotte, véhicules et maintenance",
    Bike,
    "from-sky-600 via-cyan-500 to-emerald-400",
    "Ops",
  ),
  buildActivityLink(
    "Famille",
    "/admin/family",
    "Gouvernance et permissions",
    ShieldCheck,
    "from-purple-600 via-fuchsia-600 to-pink-500",
    "Accès",
  ),
  buildActivityLink(
    "Paramètres",
    "/admin/settings",
    "Préférences et configuration",
    Settings,
    "from-gray-700 via-slate-700 to-stone-800",
    "Setup",
  ),
];

const administrationQuickLinkIndexes = new Set([0, 4, 1, 6]);

export const administrationQuickLinks = centralAdministrationLinks.filter((_, index) =>
  administrationQuickLinkIndexes.has(index),
);

export const homeNavigationLinks: DashboardAccessLink[] = [
  buildActivityLink(
    "Retour à l'accueil",
    "/home",
    "Vitrine publique et accueil principal",
    Home,
    "from-gray-600 via-gray-700 to-gray-900",
    "Accueil",
  ),
  buildActivityLink(
    "Voir les activités",
    "/home#activities",
    "Accès direct aux trois activités",
    Sparkles,
    "from-amber-600 via-orange-500 to-amber-400",
    "Hub",
  ),
];
