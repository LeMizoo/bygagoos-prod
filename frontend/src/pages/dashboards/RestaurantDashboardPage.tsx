import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarDays, Coffee, ChefHat, UtensilsCrossed, TableProperties, Wallet, Wine } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";
import restaurantApi from "../../api/restaurant.api";

// Types locaux (en attendant la vraie API)
interface Reservation {
  id: string;
  name: string;
  time: string;
  table: number;
  status: string;
}

interface Table {
  id: string;
  number: number;
  status: string;
  capacity: number;
}

interface StockAlert {
  id: string;
  message: string;
}

export default function RestaurantDashboardPage() {
  // Mock fallback si l'API n'est pas encore implémentée
  const { data: stats = { totalTables: 12, occupiedTables: 5, todayReservations: 8, occupancyRate: 42 } } = useQuery({
    queryKey: ['restaurant-stats'],
    queryFn: () => restaurantApi.getRestaurantStats().catch(() => ({ totalTables: 12, occupiedTables: 5, todayReservations: 8, occupancyRate: 42 })),
    staleTime: 5 * 60 * 1000
  });

  const { data: reservationsData = { reservations: [] as Reservation[] } } = useQuery({
    queryKey: ['restaurant-reservations-today'],
    queryFn: () => restaurantApi.getTodayReservations().catch(() => ({ reservations: [] })),
    staleTime: 2 * 60 * 1000
  });

  const { data: menuData = [] } = useQuery({
    queryKey: ['restaurant-menu-featured'],
    queryFn: () => restaurantApi.getFeaturedMenu().catch(() => []),
    staleTime: 10 * 60 * 1000
  });

  const { data: tablesData = { tables: [] as Table[] } } = useQuery({
    queryKey: ['restaurant-tables'],
    queryFn: () => restaurantApi.getTables().catch(() => ({ tables: [] })),
    staleTime: 3 * 60 * 1000
  });

  const { data: stockData = [] as StockAlert[] } = useQuery({
    queryKey: ['restaurant-stock-alerts'],
    queryFn: () => restaurantApi.getStockAlerts().catch(() => []),
    staleTime: 10 * 60 * 1000
  });

  const reservations = reservationsData.reservations || [];
  const menuHighlights = menuData || [];
  const tables = tablesData.tables || [];
  const stockAlerts = stockData || [];

  // Générer l'état des tables pour l'affichage
  const tableStatus = tables.length > 0 ? tables : [
    { table: "Table 1", status: "Occupée", color: "bg-red-100 text-red-800" },
    { table: "Table 2", status: "Libre", color: "bg-green-100 text-green-800" },
    { table: "Table 3", status: "Réservée", color: "bg-yellow-100 text-yellow-800" },
    { table: "Table 4", status: "Libre", color: "bg-green-100 text-green-800" },
    { table: "Table 5", status: "Occupée", color: "bg-red-100 text-red-800" },
    { table: "Table 6", status: "Réservée", color: "bg-yellow-100 text-yellow-800" },
  ];

  return (
    <ActivityDashboardFrame
      title="ByGagoos CDA Dashboard"
      subtitle="Pilotage du bar et du restaurant: réservations, tables, menu, stock, service et caisse."
      accent="from-rose-600 via-orange-500 to-amber-400"
      icon={UtensilsCrossed}
      metrics={[
        { label: "Tables", value: String(stats?.totalTables || 0), note: "Capacité d'accueil active", icon: TableProperties },
        { label: "Occupées", value: String(stats?.occupiedTables || 0), note: "En service actuellement", icon: Coffee },
        { label: "Réservations", value: String(stats?.todayReservations || 0), note: "Créneaux à gérer", icon: CalendarDays },
        { label: "Taux occupation", value: `${stats?.occupancyRate || 0}%`, note: "Taux actuellement", icon: Wallet },
      ]}
      actions={[
        { label: "Préparer le module", path: "/contact" },
        { label: "Retour à l'accueil", path: "/home#activities" },
      ]}
      focusItems={[
        { title: "Réservations", subtitle: "Accueil", meta: "Gérer les réservations, confirmations et rappels." },
        { title: "Salle", subtitle: "Service", meta: "Suivre l’occupation des tables et le rythme du service." },
        { title: "Menu", subtitle: "Cuisine", meta: "Mettre en avant les plats et les suggestions du jour." },
        { title: "Stock", subtitle: "Gestion", meta: "Éviter les ruptures et préparer les réassorts." },
      ]}
      processSteps={[
        "Préparer les tables",
        "Confirmer les réservations",
        "Servir et encaisser",
        "Réapprovisionner le stock",
      ]}
    >
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr_0.85fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Réservations</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Planning du service</h2>
              </div>
              <CalendarDays className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {reservations.map((item: Reservation) => (
                <div key={item.id} className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <span className="text-sm font-semibold text-gray-700">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Table {item.table}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{item.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Menu</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Plats en avant</h2>
              </div>
              <ChefHat className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {menuHighlights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun plat en avant pour le moment</p>
                </div>
              ) : (
                menuHighlights.slice(0, 4).map((item: any) => (
                  <div key={item._id} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-amber-900">{item.name}</p>
                        <p className="text-sm text-amber-800">{item.description}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-900">{item.price} Ar</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Stock</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Alertes du jour</h2>
              </div>
              <Wallet className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stockAlerts.map((item: StockAlert) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Tables</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Occupation de la salle</h2>
            </div>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tableStatus.map((table: any) => (
              <div key={table.table || table.number} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{table.table || `Table ${table.number}`}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${table.color || 'bg-gray-100 text-gray-800'}`}>
                    {table.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">Table prête pour le prochain service.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Service</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Journée d’exploitation</h2>
            <div className="mt-4 space-y-3">
              {[
                "Vérifier les réservations avant ouverture",
                "Synchroniser la cuisine et la salle",
                "Encaisser et suivre les ventes par service",
                "Clôturer la caisse et le stock en fin de service",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Actions</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Liens rapides</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Préparer tables", href: "/cda/dashboard" },
                { label: "Direction Générale", href: "/prod/dashboard" },
                { label: "Accueil", href: "/home#activities" },
                { label: "Galerie Ink", href: "/gallery" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ActivityDashboardFrame>
  );
}