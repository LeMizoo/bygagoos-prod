import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface DashboardMetric {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}

export interface DashboardAction {
  label: string;
  path: string;
}

export interface DashboardItem {
  title: string;
  subtitle: string;
  meta?: string;
}

interface ActivityDashboardFrameProps {
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
  metrics: DashboardMetric[];
  actions: DashboardAction[];
  focusItems: DashboardItem[];
  processSteps: string[];
  children?: React.ReactNode;
}

export default function ActivityDashboardFrame({
  title,
  subtitle,
  accent,
  icon: Icon,
  metrics,
  actions,
  focusItems,
  processSteps,
  children,
}: ActivityDashboardFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <section className={`relative overflow-hidden bg-gradient-to-r ${accent}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-white">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              <Icon className="h-4 w-4" />
              Dashboard dédié
            </div>
            <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const MetricIcon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-900 p-3 text-white">
                    <MetricIcon className="h-5 w-5" />
                  </div>
                </div>
                {metric.note && <p className="mt-4 text-sm text-gray-500">{metric.note}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Axes prioritaires</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {focusItems.map((item) => (
                <div key={item.title} className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                    {item.subtitle}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900">{item.title}</h3>
                  {item.meta && <p className="mt-2 text-sm text-gray-600">{item.meta}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Parcours de travail</h2>
            <div className="mt-6 space-y-3">
              {processSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}
