// frontend/src/components/dashboard/DashboardComponents.tsx
import { ReactNode, useState } from "react";
import { 
  LucideIcon, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

// ==================== STAT CARD ====================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
    label?: string;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  loading?: boolean;
  onClick?: () => void;
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-green-50 text-green-600 border-green-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  red: "bg-red-50 text-red-600 border-red-100",
  gray: "bg-gray-50 text-gray-600 border-gray-100",
};

const iconColors = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
  gray: "text-gray-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
  loading = false,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-gray-300' : ''}`}
      onClick={onClick}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
              <div className="flex items-end gap-2 flex-wrap">
                <h3 className="text-2xl font-bold text-gray-900">
                  {typeof value === "number"
                    ? value.toLocaleString("fr-FR")
                    : value}
                </h3>
                {trend && (
                  <div
                    className={`flex items-center gap-1 pb-1 ${
                      trend.direction === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend.direction === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {trend.value > 0 ? '+' : ''}{trend.value}%
                    </span>
                    {trend.label && (
                      <span className="text-xs text-gray-500 ml-1">
                        {trend.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {description && (
                <p className="text-xs text-gray-500 mt-2">{description}</p>
              )}
            </div>
            <div className={`${colorStyles[color]} p-3 rounded-lg border`}>
              <Icon className={`h-6 w-6 ${iconColors[color]}`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== SECTION ====================
interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  className?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  action,
  className = "",
}: SectionProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {action && (
          action.href ? (
            <Link
              to={action.href}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </button>
          )
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

// ==================== LIST ITEM ====================
interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: LucideIcon;
  iconColor?: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  badge?: string;
  badgeColor?: "blue" | "green" | "orange" | "red" | "gray" | "purple";
  onClick?: () => void;
  actions?: {
    icon: LucideIcon;
    onClick: () => void;
    label: string;
  }[];
}

const badgeColors = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  orange: "bg-orange-100 text-orange-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
  purple: "bg-purple-100 text-purple-800",
};

const iconBgColors = {
  blue: "bg-blue-50",
  green: "bg-green-50",
  purple: "bg-purple-50",
  orange: "bg-orange-50",
  red: "bg-red-50",
  gray: "bg-gray-50",
};

const iconTextColors = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
  gray: "text-gray-600",
};

export function ListItem({
  title,
  subtitle,
  value,
  icon: Icon,
  iconColor = "blue",
  badge,
  badgeColor = "gray",
  onClick,
  actions,
}: ListItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={`${iconBgColors[iconColor]} p-2 rounded-lg flex-shrink-0`}>
            <Icon className={`h-4 w-4 ${iconTextColors[iconColor]}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{title}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-4">
        {badge && (
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
        
        {value && (
          <p className="font-bold text-gray-900 whitespace-nowrap">{value}</p>
        )}
        
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-1">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DATA TABLE ====================
interface DataTableProps<T = unknown> {
  title: string;
  headers: string[];
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  filters?: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }[];
  onRefresh?: () => void;
  onExport?: () => void;
}

export function DataTable<T>({
  title,
  headers,
  rows,
  renderRow,
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  action,
  filters,
  onRefresh,
  onExport,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{title}</h3>
          
          <div className="flex items-center gap-3">
            {/* Filtres */}
            {filters && filters.length > 0 && (
              <div className="flex items-center gap-2">
                {filters.map((filter, idx) => (
                  <select
                    key={idx}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    aria-label={filter.placeholder || 'Filtrer'}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{filter.placeholder || "Filtrer"}</option>
                    {filter.options.map((opt, optIdx) => (
                      <option key={optIdx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Actualiser"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Exporter"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}

              {action && (
                action.href ? (
                  <Link
                    to={action.href}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </Link>
                ) : (
                  <button
                    onClick={action.onClick}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
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
            {loading ? (
              // Skeleton loading
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  {headers.map((_, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length > 0 ? (
              rows.map((row, idx) => renderRow(row, idx))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8 text-center">
                  <p className="text-gray-600 text-sm">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== CHART CARD ====================
interface ChartCardProps {
  title: string;
  children: ReactNode;
  description?: string;
  height?: number;
  actions?: {
    icon: LucideIcon;
    onClick: () => void;
    label: string;
  }[];
}

export function ChartCard({
  title,
  children,
  description,
  height = 300,
  actions,
}: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: `${height}px` }}>{children}</div>
    </div>
  );
}

// ==================== KPI CARD ====================
interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "orange" | "red";
  progress?: number;
  target?: number;
}

const kpiColors = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", progress: "bg-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-700", progress: "bg-green-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", progress: "bg-orange-600" },
  red: { bg: "bg-red-100", text: "text-red-700", progress: "bg-red-600" },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  progress,
  target,
}: KpiCardProps) {
  const percentage = progress && target ? Math.min((progress / target) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${kpiColors[color].bg} p-2 rounded-lg`}>
          <Icon className={`h-5 w-5 ${kpiColors[color].text}`} />
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      
      {progress !== undefined && target !== undefined && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium text-gray-900">
              {progress} / {target}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${kpiColors[color].progress} rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== DATE RANGE PICKER ====================
interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply?: () => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <input
          type="date"
          aria-label="Date de début"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          aria-label="Date de fin"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {onApply && (
        <button
          onClick={onApply}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Appliquer
        </button>
      )}
    </div>
  );
}

// ==================== EXPORT BUTTON ====================
interface ExportButtonProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  disabled?: boolean;
}

export function ExportButton({ onExport, disabled }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Exporter
      </button>
      
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => {
                onExport('csv');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
            >
              CSV
            </button>
            <button
              onClick={() => {
                onExport('excel');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Excel
            </button>
            <button
              onClick={() => {
                onExport('pdf');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
            >
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
