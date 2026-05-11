export type FamilyModuleKey = "prod" | "ink" | "trans" | "cda";

export interface FamilyMember {
  name: string;
  email: string;
  title: string;
  task: string;
  dashboardPath: string;
  primaryModule: FamilyModuleKey;
  moduleAccess: FamilyModuleKey[];
  initials: string;
  accent: string;
  role: "SUPER_ADMIN" | "ADMIN";
}

export const familyMembers: FamilyMember[] = [
  {
    name: "Tovoniaina Rahendrison",
    email: "tovoniaina.rahendrison@gmail.com",
    title: "Direction Générale",
    task: "Gouvernance, vision et arbitrage transversal",
    dashboardPath: "/prod/dashboard",
    primaryModule: "prod",
    moduleAccess: ["prod", "ink", "trans", "cda"],
    initials: "TR",
    accent: "from-amber-600 to-orange-500",
    role: "SUPER_ADMIN",
  },
  {
    name: "Volatiana Randrianarisoa",
    email: "dedettenadia@gmail.com",
    title: "Direction artistique",
    task: "Création, identité visuelle et design ByGagoos Ink",
    dashboardPath: "/ink/dashboard",
    primaryModule: "ink",
    moduleAccess: ["prod", "ink"],
    initials: "VR",
    accent: "from-sky-600 to-cyan-500",
    role: "ADMIN",
  },
  {
    name: "Miantsatiana Rahendrison",
    email: "miantsatianarahendrison@gmail.com",
    title: "Direction opérationnelle",
    task: "Exploitation, flotte Taxi-Moto et maintenance",
    dashboardPath: "/trans/dashboard",
    primaryModule: "trans",
    moduleAccess: ["prod", "trans"],
    initials: "MR",
    accent: "from-emerald-600 to-teal-500",
    role: "ADMIN",
  },
  {
    name: "Tia Faniry Rahendrison",
    email: "fanirytia17@gmail.com",
    title: "Direction communication & accueil",
    task: "Relations clients, hospitalité et bar/restaurant",
    dashboardPath: "/cda/dashboard",
    primaryModule: "cda",
    moduleAccess: ["prod", "cda"],
    initials: "TF",
    accent: "from-rose-600 to-fuchsia-500",
    role: "ADMIN",
  },
];
