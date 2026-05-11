import { Briefcase, Building2, ShieldCheck, type LucideIcon } from "lucide-react";
import { activityModules } from "./activities";

export interface FamilyExecutive {
  name: string;
  role: string;
  title: string;
  description: string;
  initials: string;
  accent: string;
}

export interface BusinessUnitSummary {
  name: string;
  tagline: string;
  route: string;
  icon: LucideIcon;
  accent: string;
}

export const prodBrand = {
  name: "ByGagoos Prod",
  tagline:
    "Une maison familiale, trois activités, une direction générale unique et un socle technique commun.",
  summary:
    "ByGagoos Prod rassemble la sérigraphie, le Taxi-Moto et le bar-restaurant dans une même application modulaire.",
};

export const directionGenerale: FamilyExecutive[] = [
  {
    name: "Tovoniaina RAHENDRISON",
    role: "Super Admin",
    title: "Direction générale",
    description: "Pilote l’ensemble des activités et arbitre les décisions stratégiques.",
    initials: "TR",
    accent: "from-amber-600 to-orange-500",
  },
  {
    name: "Famille - Administration",
    role: "Admin familial",
    title: "Finance et conformité",
    description: "Suit les flux, la rigueur des dossiers et la cohérence des opérations.",
    initials: "AF",
    accent: "from-sky-600 to-cyan-500",
  },
  {
    name: "Famille - Opérations",
    role: "Admin familial",
    title: "Opérations et suivi",
    description: "Coordonne l’exécution, les priorités terrain et la fluidité interne.",
    initials: "AO",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    name: "Famille - Développement",
    role: "Admin familial",
    title: "Produit et croissance",
    description: "Prépare les évolutions de ByGagoos Prod et les nouveaux modules.",
    initials: "AD",
    accent: "from-rose-600 to-fuchsia-500",
  },
];

export const businessUnits: BusinessUnitSummary[] = activityModules.map((module) => ({
  name: module.name,
  tagline: module.tagline,
  route: module.path,
  icon: module.icon,
  accent: module.accent,
}));

export const executivePillars = [
  {
    title: "Gouvernance",
    description: "Direction générale familiale, arbitrage et vision commune.",
    icon: ShieldCheck,
  },
  {
    title: "Exécution",
    description: "Des modules spécialisés pour chaque activité métier.",
    icon: Briefcase,
  },
  {
    title: "Structure",
    description: "Une base partagée pour évoluer sans casser l’existant.",
    icon: Building2,
  },
];
