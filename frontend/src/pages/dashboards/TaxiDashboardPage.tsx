import { Bike, CalendarClock, Gauge, MapPin, Phone, ShieldCheck, Wrench, Users } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";

const drivers = [
  { name: "Aina", status: "En course", vehicle: "TG-128-AB", phone: "+261 34 00 111 01" },
  { name: "Liva", status: "Disponible", vehicle: "TG-215-CD", phone: "+261 34 00 111 02" },
  { name: "Mamy", status: "Repos", vehicle: "TG-322-EF", phone: "+261 34 00 111 03" },
  { name: "Kanto", status: "Maintenance", vehicle: "TG-401-GH", phone: "+261 34 00 111 04" },
];

const trips = [
  { route: "Ankatso → Analakely", time: "08:30", status: "Complété", amount: "8 000 Ar" },
  { route: "Ivandry → 67Ha", time: "10:15", status: "En cours", amount: "6 500 Ar" },
  { route: "Ambohimanarina → Centre", time: "11:40", status: "Planifié", amount: "7 000 Ar" },
  { route: "Tana Water Front → Itaosy", time: "13:00", status: "Planifié", amount: "12 000 Ar" },
];

const maintenance = [
  { item: "Vidange TG-401-GH", date: "Aujourd'hui", owner: "Garage interne" },
  { item: "Freins TG-215-CD", date: "Demain", owner: "Atelier partenaire" },
  { item: "Contrôle pneus TG-128-AB", date: "Cette semaine", owner: "Chef flotte" },
];

export default function TaxiDashboardPage() {
  return (
    <ActivityDashboardFrame
      title="ByGagoos Trans Dashboard"
      subtitle="Pilotage de la flotte Taxi-Moto: véhicules, chauffeurs, missions du jour, maintenance et disponibilité."
      accent="from-sky-600 via-cyan-500 to-emerald-400"
      icon={Bike}
      metrics={[
        { label: "Véhicules", value: "12", note: "Flotte active et surveillée", icon: Bike },
        { label: "Disponibles", value: "8", note: "Prêts à être affectés", icon: Gauge },
        { label: "En service", value: "3", note: "Déjà sur le terrain", icon: MapPin },
        { label: "Maintenance", value: "2", note: "Suivi atelier", icon: Wrench },
      ]}
      actions={[
        { label: "Gérer les véhicules", path: "/admin/taxi/vehicles" },
        { label: "Voir la Direction Générale", path: "/prod/dashboard" },
      ]}
      focusItems={[
        { title: "Affectation chauffeurs", subtitle: "Exploitation", meta: "Associer vite un conducteur à un véhicule disponible." },
        { title: "Suivi des courses", subtitle: "Opérations", meta: "Voir les courses planifiées, en cours et terminées." },
        { title: "Maintenance", subtitle: "Sécurité", meta: "Prévenir les pannes avant qu’elles n’arrêtent la flotte." },
        { title: "Zone d’activité", subtitle: "Terrain", meta: "Repérer les zones les plus actives et les pics horaires." },
      ]}
      processSteps={[
        "Vérifier les véhicules",
        "Affecter les chauffeurs",
        "Suivre les courses",
        "Planifier la maintenance",
      ]}
    >
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Conduite</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Chauffeurs et véhicules</h2>
              </div>
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {drivers.map((driver) => (
                <div key={driver.name} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{driver.status}</p>
                    <p className="flex items-center justify-end gap-1 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />
                      {driver.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Maintenance</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Suivi atelier</h2>
              </div>
              <Wrench className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {maintenance.map((item) => (
                <div key={item.item} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="font-semibold text-amber-900">{item.item}</p>
                  <p className="mt-1 text-sm text-amber-800">{item.date} · {item.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Courses du jour</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Trajets et encaissements</h2>
            </div>
            <CalendarClock className="h-6 w-6 text-gray-400" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trajet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Heure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {trips.map((trip) => (
                  <tr key={trip.route} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{trip.route}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{trip.time}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{trip.status}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">{trip.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Sécurité</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Checklist de flotte</h2>
            <div className="mt-4 space-y-3">
              {[
                "Casques, gilets et papiers à jour",
                "Assurance des véhicules validée",
                "Kilométrage suivi chaque matin",
                "Véhicules loués séparés des véhicules disponibles",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Interactions</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Actions rapides</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Créer véhicule", to: "/admin/taxi/vehicles" },
                { label: "Voir commandes", to: "/admin/orders" },
                { label: "Retour accueil", to: "/home#activities" },
                { label: "Direction Générale", to: "/prod/dashboard" },
              ].map((action) => (
                <a key={action.label} href={action.to} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100">
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ActivityDashboardFrame>
  );
}
