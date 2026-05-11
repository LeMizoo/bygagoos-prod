import { Bike, Palette, UtensilsCrossed, type LucideIcon } from "lucide-react";

export type ActivityKey = "ink" | "trans" | "cda";

export interface ActivityStat {
  label: string;
  value: string;
}

export interface ActivityModule {
  key: ActivityKey;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  path: string;
  icon: LucideIcon;
  accent: string;
  stats: ActivityStat[];
  highlights: string[];
  primaryAction: {
    label: string;
    path: string;
  };
  secondaryAction?: {
    label: string;
    path: string;
  };
  comingSoon?: boolean;
}

export const activityModules: ActivityModule[] = [
  {
    key: "ink",
    name: "ByGagoos Ink",
    shortName: "Sérigraphie",
    tagline: "Designs, commandes et production créative",
    description:
      "Le cœur historique de l'application: suivi des designs, commandes, clients et production.",
    path: "/ink/dashboard",
    icon: Palette,
    accent: "from-amber-600 via-orange-500 to-amber-400",
    stats: [
      { label: "Designs", value: "2000+" },
      { label: "Commandes", value: "1800+" },
      { label: "Clients", value: "500+" },
    ],
    highlights: ["Catalogue créatif", "Workflow commandes", "Galerie publique"],
    primaryAction: {
      label: "Ouvrir le dashboard Ink",
      path: "/ink/dashboard",
    },
    secondaryAction: {
      label: "Voir la galerie",
      path: "/gallery",
    },
  },
  {
    key: "trans",
    name: "ByGagoos Trans",
    shortName: "Taxi-Moto",
    tagline: "Gestion de flotte, chauffeurs et exploitation",
    description:
      "Une base solide pour gérer les véhicules, puis étendre vers chauffeurs, courses, entretien et contrats.",
    path: "/trans/dashboard",
    icon: Bike,
    accent: "from-sky-600 via-cyan-500 to-emerald-400",
    stats: [
      { label: "Véhicules", value: "12" },
      { label: "Conducteurs", value: "8" },
      { label: "Missions", value: "120+" },
    ],
    highlights: ["Flotte", "Maintenance", "Suivi d'activité"],
    primaryAction: {
      label: "Ouvrir le dashboard Trans",
      path: "/trans/dashboard",
    },
    secondaryAction: {
      label: "Voir les commandes",
      path: "/admin/orders",
    },
  },
  {
    key: "cda",
    name: "ByGagoos CDA",
    shortName: "Bar & Restaurant",
    tagline: "Réservations, service de salle et exploitation",
    description:
      "Le futur module pour le bar et le restaurant: tables, réservations, caisse, stock et suivi du service.",
    path: "/cda/dashboard",
    icon: UtensilsCrossed,
    accent: "from-rose-600 via-orange-500 to-amber-400",
    stats: [
      { label: "Tables", value: "24" },
      { label: "Réservations", value: "60+" },
      { label: "Services", value: "2" },
    ],
    highlights: ["Tables", "Réservations", "Stocks"],
    primaryAction: {
      label: "Ouvrir le dashboard CDA",
      path: "/cda/dashboard",
    },
    secondaryAction: {
      label: "En savoir plus",
      path: "/help",
    },
    comingSoon: true,
  },
];

export const activityModulesByKey = Object.fromEntries(
  activityModules.map((module) => [module.key, module]),
) as Record<ActivityKey, ActivityModule>;
