import { BarChart3, CalendarDays, Coffee, ChefHat, UtensilsCrossed, TableProperties, Wallet, Wine } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";

const reservations = [
  { name: "Famille Rakoto", time: "12:30", table: "T4", status: "Confirmée" },
  { name: "Entreprise MADA", time: "13:15", table: "T8", status: "En attente" },
  { name: "Nantena & co", time: "19:00", table: "T2", status: "Confirmée" },
  { name: "Groupe amis", time: "20:15", table: "T10", status: "À rappeler" },
];

const menuHighlights = [
  { title: "Filet de poulet grillé", price: "28 000 Ar", note: "Plat signature" },
  { title: "Poulet rôti maison", price: "32 000 Ar", note: "Très demandé" },
  { title: "Jus frais maison", price: "8 000 Ar", note: "Boisson du jour" },
  { title: "Menu famille", price: "75 000 Ar", note: "Offre groupe" },
];

const tableStatus = [
  { table: "T1", status: "Libre", color: "bg-emerald-100 text-emerald-800" },
  { table: "T2", status: "Réservée", color: "bg-amber-100 text-amber-800" },
  { table: "T3", status: "Occupée", color: "bg-blue-100 text-blue-800" },
  { table: "T4", status: "Libre", color: "bg-emerald-100 text-emerald-800" },
  { table: "T5", status: "Entretien", color: "bg-gray-100 text-gray-800" },
  { table: "T6", status: "Réservée", color: "bg-amber-100 text-amber-800" },
];

const stockAlerts = [
  "Boissons fraîches à réapprovisionner",
  "Sauce tomate presque épuisée",
  "Huiles et condiments à vérifier",
  "Vérifier les pains du service du soir",
];

export default function RestaurantDashboardPage() {
  return (
    <ActivityDashboardFrame
      title="ByGagoos CDA Dashboard"
      subtitle="Pilotage du bar et du restaurant: réservations, tables, menu, stock, service et caisse."
      accent="from-rose-600 via-orange-500 to-amber-400"
      icon={UtensilsCrossed}
      metrics={[
        { label: "Tables", value: "24", note: "Capacité d’accueil active", icon: TableProperties },
        { label: "Réservations", value: "60+", note: "Créneaux à gérer", icon: CalendarDays },
        { label: "Service", value: "2", note: "Midi et soir", icon: Coffee },
        { label: "Caisse", value: "100%", note: "Pilotage prêt", icon: Wallet },
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
              {reservations.map((item) => (
                <div key={item.name} className="rounded-2xl bg-gray-50 px-4 py-3">
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
              {menuHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-amber-900">{item.title}</p>
                      <p className="text-sm text-amber-800">{item.note}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-900">{item.price}</span>
                  </div>
                </div>
              ))}
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
              {stockAlerts.map((item) => (
                <div key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {item}
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
            {tableStatus.map((table) => (
              <div key={table.table} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{table.table}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${table.color}`}>{table.status}</span>
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
