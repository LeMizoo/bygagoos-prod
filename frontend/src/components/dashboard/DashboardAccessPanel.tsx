import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardAccessLink } from "../../data/dashboardNavigation";

interface DashboardAccessPanelProps {
  title: string;
  subtitle?: string;
  links: DashboardAccessLink[];
  columns?: 2 | 3 | 4;
  compact?: boolean;
}

export default function DashboardAccessPanel({
  title,
  subtitle,
  links,
  columns = 2,
  compact = false,
}: DashboardAccessPanelProps) {
  const gridClass =
    columns === 4
      ? "xl:grid-cols-4"
      : columns === 3
        ? "xl:grid-cols-3"
        : "xl:grid-cols-2";

  return (
    <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            {title}
          </p>
          {subtitle && <h2 className="mt-2 text-2xl font-bold text-gray-900">{subtitle}</h2>}
        </div>
      </div>

      <div className={`mt-6 grid gap-4 sm:grid-cols-2 ${gridClass}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                compact ? "min-h-[170px]" : "min-h-[200px]"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${link.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className={`inline-flex rounded-2xl bg-gradient-to-r ${link.accent} p-3 text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {link.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">{link.label}</h3>
                {link.description && (
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {link.description.length > 80 ? `${link.description.slice(0, 77)}...` : link.description}
                  </p>
                )}

                <div className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-amber-700">
                  Ouvrir
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
