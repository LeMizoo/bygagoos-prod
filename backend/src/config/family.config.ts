export type FamilyModuleKey = "prod" | "ink" | "trans" | "cda";

export interface FamilyMemberAccess {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  title: string;
  task: string;
  dashboardPath: string;
  primaryModule: FamilyModuleKey;
  moduleAccess: FamilyModuleKey[];
}

export const familyMembers: FamilyMemberAccess[] = [
  {
    email: "tovoniaina.rahendrison@gmail.com",
    name: "Tovoniaina Rahendrison",
    role: "SUPER_ADMIN",
    title: "Direction Générale",
    task: "Gouvernance, vision et arbitrage transversal",
    dashboardPath: "/prod/dashboard",
    primaryModule: "prod",
    moduleAccess: ["prod", "ink", "trans", "cda"],
  },
  {
    email: "dedettenadia@gmail.com",
    name: "Volatiana Randrianarisoa",
    role: "ADMIN",
    title: "Direction artistique",
    task: "Création, identité visuelle et design ByGagoos Ink",
    dashboardPath: "/ink/dashboard",
    primaryModule: "ink",
    moduleAccess: ["prod", "ink"],
  },
  {
    email: "miantsatianarahendrison@gmail.com",
    name: "Miantsatiana Rahendrison",
    role: "ADMIN",
    title: "Direction opérationnelle",
    task: "Exploitation, flotte Taxi-Moto et maintenance",
    dashboardPath: "/trans/dashboard",
    primaryModule: "trans",
    moduleAccess: ["prod", "trans"],
  },
  {
    email: "fanirytia17@gmail.com",
    name: "Tia Faniry Rahendrison",
    role: "ADMIN",
    title: "Direction communication & accueil",
    task: "Relations clients, hospitalité et bar/restaurant",
    dashboardPath: "/cda/dashboard",
    primaryModule: "cda",
    moduleAccess: ["prod", "cda"],
  },
];

export const familyMemberByEmail = new Map(
  familyMembers.map((member) => [member.email, member]),
);

export const isFamilyEmail = (email: string) => familyMemberByEmail.has(email.trim().toLowerCase());
