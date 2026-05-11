import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Shield, Sparkles } from "lucide-react";
import { activityModulesByKey, type ActivityKey } from "../../data/activities";

interface ActivityModulePageProps {
  moduleKey: ActivityKey;
}

export default function ActivityModulePage({ moduleKey }: ActivityModulePageProps) {
  const module = activityModulesByKey[moduleKey];
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className={`relative overflow-hidden border-b border-gray-200 bg-gradient-to-r ${module.accent}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Monolithe modulaire
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-3xl bg-white/15 p-4 backdrop-blur-sm">
                <Icon className="h-10 w-10" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                  {module.shortName}
                </p>
                <h1 className="text-4xl font-bold sm:text-5xl">{module.name}</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/90">
              {module.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={module.primaryAction.path}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                {module.primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {module.secondaryAction && (
                <Link
                  to={module.secondaryAction.path}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {module.secondaryAction.label}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {module.stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">Architecture de départ</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Cette activité repose sur la même base technique que ByGagoos Ink, mais avec
                ses propres modules métier, ses routes API et ses écrans dédiés.
              </p>
              <p>
                La première brique est déjà en place. Pour Taxi-Moto, on peut ensuite ajouter
                les conducteurs, les trajets, la maintenance et les contrats sans casser le
                cœur sérigraphie.
              </p>
              <p>
                Pour le bar / restaurant, le module est préparé pour accueillir les tables,
                réservations, stock, caisse et service de salle.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Prochaines actions</h2>
            <div className="mt-6 space-y-3">
              {module.highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <span className="font-medium text-gray-700">{item}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                    Priorité
                  </span>
                </div>
              ))}
            </div>

            {module.comingSoon && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Ce module est affiché comme prochain chantier. On peut le détailler ensuite
                avec la même logique que Taxi-Moto.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
