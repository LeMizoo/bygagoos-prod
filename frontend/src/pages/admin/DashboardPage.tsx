import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import DashboardAccessPanel from "../../components/dashboard/DashboardAccessPanel";
import {
  centralAdministrationLinks,
  homeNavigationLinks,
  transversalDashboardLinks,
} from "../../data/dashboardNavigation";
import { directionGenerale, executivePillars, prodBrand } from "../../data/prod";

const governanceStats = [
  { label: "Membres direction", value: "4", icon: Crown },
  { label: "Activités", value: "3", icon: Sparkles },
  { label: "Socle technique", value: "1", icon: ShieldCheck },
  { label: "Vision", value: "ByGagoos Prod", icon: Briefcase },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-amber-950 via-stone-900 to-slate-950 p-8 text-white shadow-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Crown className="h-4 w-4" />
              Direction Générale
            </div>
            <h1 className="mt-5 text-4xl font-black sm:text-5xl">{prodBrand.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
              {prodBrand.summary} La Direction Générale reste familiale et coordonne les
              trois activités avec une même vision, une même rigueur et un même socle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                Retour à l’accueil
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/family"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Gouvernance familiale
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-3">
              {governanceStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl bg-black/20 p-4">
                    <Icon className="h-5 w-5 text-amber-300" />
                    <div className="mt-2 text-2xl font-black">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-3xl bg-white p-5 text-gray-900">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                Priorité de la semaine
              </p>
              <p className="mt-3 text-lg font-bold">Aligner les trois dashboards sur le même socle</p>
              <p className="mt-2 text-sm text-gray-600">
                Chaque activité garde son propre écran, mais l’accès et la lecture se font
                désormais depuis un centre de commande unique.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardAccessPanel
          title="Centre de commande"
          subtitle="Tous les dashboards métiers à portée de main"
          links={transversalDashboardLinks}
          columns={4}
        />

        <DashboardAccessPanel
          title="Administration centrale"
          subtitle="Équipe, clients, commandes et réglages"
          links={centralAdministrationLinks}
          columns={4}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {directionGenerale.map((member) => (
          <div key={member.name} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-2xl bg-gradient-to-r ${member.accent} px-4 py-3 text-lg font-black text-white`}>
              {member.initials}
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">{member.name}</h2>
            <p className="mt-1 text-sm font-semibold text-amber-700">{member.role}</p>
            <p className="mt-3 text-sm font-medium text-gray-900">{member.title}</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">{member.description}</p>
          </div>
        ))}
      </section>

      <DashboardAccessPanel
        title="Vitrine rapide"
        subtitle="Retour vers l’accueil et le hub activités"
        links={homeNavigationLinks}
        columns={2}
        compact
      />

      <div className="grid gap-6 xl:grid-cols-3">
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

      <section className="rounded-[2rem] bg-gradient-to-r from-gray-900 to-stone-800 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
              Direction Générale
            </p>
            <h2 className="mt-3 text-3xl font-bold">Le socle commun de ByGagoos Prod</h2>
            <p className="mt-3 max-w-3xl text-white/80">
              Cette page sert désormais de porte d’entrée unique pour naviguer entre les
              activités, l’administration centrale et la gouvernance familiale.
            </p>
          </div>
          <Link
            to="/home#activities"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg"
          >
            Explorer les activités
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
