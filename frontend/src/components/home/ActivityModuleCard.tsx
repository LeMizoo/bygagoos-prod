import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ActivityModule } from "../../data/activities";

interface ActivityModuleCardProps {
  module: ActivityModule;
}

export default function ActivityModuleCard({ module }: ActivityModuleCardProps) {
  const Icon = module.icon;

  return (
    <Link
      to={module.path}
      className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${module.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-8`} />

      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="inline-flex rounded-2xl bg-gray-900 p-3 text-white shadow-lg">
            <Icon className="h-6 w-6" />
          </div>
          {module.comingSoon ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Bientôt disponible
            </span>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Actif
            </span>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            {module.shortName}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{module.name}</h3>
          <p className="mt-2 text-sm text-gray-600">{module.tagline}</p>
        </div>

        <p className="mb-5 text-sm leading-6 text-gray-600">{module.description}</p>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {module.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-gray-50 p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {module.highlights.map((item) => (
            <span
              key={item}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-amber-700">
          <span>Ouvrir le module</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
