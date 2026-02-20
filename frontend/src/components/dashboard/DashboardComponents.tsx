import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray";
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-50 text-gray-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {typeof value === "number"
                ? value.toLocaleString("fr-FR")
                : value}
            </h3>
            {trend && (
              <div
                className={`flex items-center gap-1 pb-1 ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{trend.value}%</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`${colorStyles[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardSection({
  title,
  description,
  children,
}: SectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: LucideIcon;
  badge?: string;
}

export function ListItem({
  title,
  subtitle,
  value,
  icon: Icon,
  badge,
}: ListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <div className="bg-blue-50 p-2 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{title}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      <div className="text-right">
        {value && <p className="font-bold text-gray-900">{value}</p>}
        {badge && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

interface DataTableProps {
  title: string;
  headers: string[];
  rows: any[];
  renderRow: (row: any, index: number) => ReactNode;
}

export function DataTable({ title, headers, rows, renderRow }: DataTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {renderRow(row, idx)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8 text-center">
                  <p className="text-gray-600 text-sm">
                    Aucune donnée disponible
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
