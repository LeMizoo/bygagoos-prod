import { useQuery } from '@tanstack/react-query';
import { Bike, CalendarClock, Gauge, MapPin, Wrench } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";
import taxiApi from "../../api/taxi.api";

interface Trip {
  id: string;
  pickupLocation: string;
  dropLocation: string;
  passenger: string;
  fare: number;
  status: string;
  route?: string;
  time?: string;
  amount?: number;
}

interface Maintenance {
  id: string;
  type: string;
  date: string;
  mechanic?: string;
}

export default function TaxiDashboardPage() {
  const { data: stats = { totalVehicles: 15, activeVehicles: 8, todayTrips: 12, vehiclesInMaintenance: 2 } } = useQuery({
    queryKey: ['taxi-stats'],
    queryFn: () => taxiApi.getFleetStats().catch(() => ({ totalVehicles: 15, activeVehicles: 8, todayTrips: 12, vehiclesInMaintenance: 2 })),
    staleTime: 5 * 60 * 1000
  });

  const { data: tripsData = { trips: [] as Trip[] } } = useQuery({
    queryKey: ['taxi-trips-today'],
    queryFn: () => taxiApi.getTodayTrips().catch(() => ({ trips: [] })),
    staleTime: 2 * 60 * 1000
  });

  const { data: maintenanceData = { maintenance: [] as Maintenance[] } } = useQuery({
    queryKey: ['taxi-maintenance'],
    queryFn: () => taxiApi.getMaintenanceDueSoon(7).catch(() => ({ maintenance: [] })),
    staleTime: 10 * 60 * 1000
  });

  const trips = tripsData.trips || [];
  const maintenance = maintenanceData.maintenance || [];

  const displayTrips: Trip[] = trips.length > 0 ? trips : [
    { id: "1", pickupLocation: "Aéroport", dropLocation: "Centre ville", passenger: "M. Andry", fare: 15000, status: "Terminé", route: "Aéroport → Centre", time: "09:30", amount: 15000 },
    { id: "2", pickupLocation: "Gare routière", dropLocation: "Mahamasina", passenger: "Mme Voahangy", fare: 8000, status: "En cours", route: "Gare → Mahamasina", time: "10:15", amount: 8000 },
    { id: "3", pickupLocation: "Antsonjombe", dropLocation: "Andraharo", passenger: "Rija", fare: 12000, status: "Planifiée", route: "Antsonjombe → Andraharo", time: "14:00", amount: 12000 },
    { id: "4", pickupLocation: "Ankorondrano", dropLocation: "Ivandry", passenger: "Lova", fare: 10000, status: "Terminé", route: "Ankorondrano → Ivandry", time: "08:45", amount: 10000 },
  ];

  return (
    <ActivityDashboardFrame
      title="ByGagoos Trans Dashboard"
      subtitle="Pilotage de la flotte Taxi-Moto: véhicules, chauffeurs, missions du jour, maintenance et disponibilité."
      accent="from-sky-600 via-cyan-500 to-emerald-400"
      icon={Bike}
      metrics={[
        { label: "Véhicules", value: String(stats?.totalVehicles || 0), note: "Flotte active et surveillée", icon: Bike },
        { label: "Disponibles", value: String(stats?.activeVehicles || 0), note: "Prêts à être affectés", icon: Gauge },
        { label: "En service", value: String(stats?.todayTrips || 0), note: "Déjà sur le terrain", icon: MapPin },
        { label: "Maintenance", value: String(stats?.vehiclesInMaintenance || 0), note: "Suivi atelier", icon: Wrench },
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
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Courses</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Missions du jour</h2>
              </div>
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              {displayTrips.slice(0, 4).map((trip: Trip) => (
                <div key={trip.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{trip.pickupLocation} → {trip.dropLocation}</p>
                    <p className="text-sm text-gray-600">{trip.passenger}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{trip.fare} Ar</p>
                    <p className="text-xs text-gray-500 uppercase">{trip.status}</p>
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
              {maintenance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune maintenance planifiée</p>
                </div>
              ) : (
                maintenance.slice(0, 3).map((item: Maintenance) => (
                  <div key={item.id} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="font-semibold text-amber-900">{item.type}</p>
                    <p className="mt-1 text-sm text-amber-800">
                      {new Date(item.date).toLocaleDateString('fr-FR')} · {item.mechanic || 'À confirmer'}
                    </p>
                  </div>
                ))
              )}
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
                {displayTrips.map((trip: Trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{trip.route || `${trip.pickupLocation} → ${trip.dropLocation}`}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{trip.time || "10:00"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{trip.status}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">{trip.amount || trip.fare} Ar</td>
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
              ].map((item: string) => (
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
              ].map((action: { label: string; to: string }) => (
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