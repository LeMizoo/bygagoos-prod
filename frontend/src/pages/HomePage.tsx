import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  UtensilsCrossed,
  Palette,
  Users,
  ArrowUpRight,
  Crown,
  CheckCircle2,
} from "lucide-react";
import ActivityModuleCard from "../components/home/ActivityModuleCard";
import { activityModules } from "../data/activities";
import { businessUnits, directionGenerale, executivePillars, prodBrand } from "../data/prod";

const heroStats = [
  { label: "Activités", value: "3", icon: Sparkles },
  { label: "Direction", value: "4", icon: Crown },
  { label: "Socle", value: "1", icon: Shield },
];

const activityHighlights = [
  {
    icon: Palette,
    title: "ByGagoos Ink",
    text: "Designs, commandes, production et galerie publique.",
    route: "/ink/dashboard",
  },
  {
    icon: Truck,
    title: "ByGagoos Trans",
    text: "Flotte Taxi-Moto, conducteurs, maintenance et missions.",
    route: "/trans/dashboard",
  },
  {
    icon: UtensilsCrossed,
    title: "ByGagoos CDA",
    text: "Bar / restaurant, réservations, salle et exploitation.",
    route: "/cda/dashboard",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f6f2ea] text-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-[-20%] left-1/3 h-80 w-80 rounded-full bg-rose-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Maison familiale multi-activités
              </div>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                {prodBrand.name}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
                {prodBrand.tagline}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
                {prodBrand.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/prod/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Voir la Direction Générale
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/home#activities"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Explorer les activités
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-3 gap-3">
                {heroStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl bg-black/20 p-4 text-center">
                      <Icon className="mx-auto h-5 w-5 text-amber-300" />
                      <div className="mt-2 text-2xl font-bold">{stat.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl bg-white p-5 text-gray-900">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Structure
                  </span>
                </div>
                <div className="space-y-3">
                  {businessUnits.map((unit) => {
                    const Icon = unit.icon;
                    return (
                      <div key={unit.name} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                        <div className={`rounded-xl bg-gradient-to-r ${unit.accent} p-2 text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{unit.name}</p>
                          <p className="text-xs text-gray-500">{unit.tagline}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {activityHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.route}
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-gray-900 p-3 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h2 className="mt-6 text-2xl font-bold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
                <p className="mt-6 text-sm font-semibold text-amber-700">Ouvrir le dashboard</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="activities" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Les trois activités
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Un seul système, trois espaces métier</h2>
          </div>
          <Link to="/prod/dashboard" className="hidden text-sm font-semibold text-gray-700 md:inline-flex">
            Accéder à la Direction Générale
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {activityModules.map((module) => (
            <ActivityModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Direction Générale
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Le noyau familial qui pilote ByGagoos Prod</h2>
            <p className="mt-3 max-w-3xl text-gray-600">
              La gouvernance reste familiale. Tovoniaina RAHENDRISON garde le rôle de super admin,
              entouré de trois autres membres administratifs de la famille. Les noms peuvent être
              complétés ensuite si tu veux les afficher publiquement.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {directionGenerale.map((member) => (
              <div key={member.title} className="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5">
                <div className={`inline-flex rounded-2xl bg-gradient-to-r ${member.accent} px-4 py-3 text-lg font-black text-white`}>
                  {member.initials}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-amber-700">{member.role}</p>
                <p className="mt-3 text-sm font-medium text-gray-900">{member.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {executivePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
