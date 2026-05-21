import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Bike, CalendarClock, Gauge, MapPin, Wrench, 
  Users, Car, AlertCircle, Plus, Eye, Star,
  Palette, UtensilsCrossed, Crown
} from "lucide-react";
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

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  rating: number;
  totalTrips: number;
}

export default function TaxiDashboardPage() {
  const { data: stats = { totalVehicles: 0, activeVehicles: 0, todayTrips: 0, vehiclesInMaintenance: 0 } } = useQuery({
    queryKey: ['taxi-stats'],
    queryFn: () => taxiApi.getFleetStats().catch(() => ({ totalVehicles: 0, activeVehicles: 0, todayTrips: 0, vehiclesInMaintenance: 0 })),
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

  const { data: driversData = { drivers: [] as Driver[], total: 0, available: 0 } } = useQuery({
    queryKey: ['taxi-drivers-stats'],
    queryFn: () => taxiApi.getDrivers({ limit: 10 }).catch(() => ({ drivers: [], total: 0, available: 0 })),
    staleTime: 5 * 60 * 1000
  });

  const trips = tripsData.trips || [];
  const maintenance = maintenanceData.maintenance || [];
  const drivers = driversData.drivers || [];
  const driversTotal = driversData.total || 0;
  const driversAvailable = driversData.available || 0;

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    ON_DUTY: 'bg-blue-100 text-blue-700',
    OFF_DUTY: 'bg-gray-100 text-gray-700',
    SUSPENDED: 'bg-red-100 text-red-700'
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    ON_DUTY: 'En service',
    OFF_DUTY: 'Hors service',
    SUSPENDED: 'Suspendu'
  };

  const displayTrips: Trip[] = trips.length > 0 ? trips : [
    { id: "1", pickupLocation: "Aéroport", dropLocation: "Centre ville", passenger: "M. Andry", fare: 15000, status: "Terminé", route: "Aéroport → Centre", time: "09:30", amount: 15000 },
    { id: "2", pickupLocation: "Gare routière", dropLocation: "Mahamasina", passenger: "Mme Voahangy", fare: 8000, status: "En cours", route: "Gare → Mahamasina", time: "10:15", amount: 8000 },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const activityLinks = [
    { name: "ByGagoos Ink", icon: Palette, href: "/ink/dashboard", current: false, color: "text-purple-600 bg-purple-100" },
    { name: "ByGagoos Trans", icon: Bike, href: "/trans/dashboard", current: true, color: "text-cyan-600 bg-cyan-100" },
    { name: "ByGagoos CDA", icon: UtensilsCrossed, href: "/cda/dashboard", current: false, color: "text-amber-600 bg-amber-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation entre activités */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-gray-500">Basculer vers :</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {activityLinks.map((activity) => {
              const Icon = activity.icon;
              return (
                <Link
                  key={activity.name}
                  to={activity.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activity.current
                      ? "bg-gray-100 text-gray-900 cursor-default"
                      : `${activity.color} hover:opacity-80 hover:scale-105`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{activity.name}</span>
                </Link>
              );
            })}
          </div>
          <Link
            to="/prod/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
          >
            <Crown className="h-4 w-4" />
            <span className="text-sm font-medium">Direction Générale</span>
          </Link>
        </div>
      </div>

      <ActivityDashboardFrame
        title="ByGagoos Trans Dashboard"
        subtitle="Pilotage de la flotte Taxi-Moto: véhicules, conducteurs, missions du jour, maintenance et disponibilité."
        accent="from-sky-600 via-cyan-500 to-emerald-400"
        icon={Bike}
        metrics={[
          { label: "Véhicules", value: String(stats?.totalVehicles || 0), note: "Flotte active et surveillée", icon: Bike },
          { label: "Conducteurs", value: String(driversTotal), note: `${driversAvailable} disponibles`, icon: Users },
          { label: "Courses", value: String(stats?.todayTrips || 0), note: "Aujourd'hui", icon: MapPin },
          { label: "Maintenance", value: String(stats?.vehiclesInMaintenance || 0), note: "Véhicules en atelier", icon: Wrench },
        ]}
        actions={[
          { label: "Gérer les véhicules", path: "/admin/taxi/vehicles" },
          { label: "Gérer les conducteurs", path: "/admin/taxi/drivers" },
          { label: "Direction Générale", path: "/prod/dashboard" },
        ]}
        focusItems={[
          { title: "Conducteurs disponibles", subtitle: "Ressources", meta: `${driversAvailable} conducteurs prêts à prendre la route.` },
          { title: "Véhicules actifs", subtitle: "Flotte", meta: `${stats?.activeVehicles || 0} véhicules en circulation.` },
          { title: "Maintenance", subtitle: "Sécurité", meta: `${stats?.vehiclesInMaintenance || 0} véhicules en atelier.` },
          { title: "Courses du jour", subtitle: "Activité", meta: `${stats?.todayTrips || 0} courses programmées.` },
        ]}
        processSteps={[
          "Vérifier les véhicules",
          "Affecter les conducteurs",
          "Suivre les courses",
          "Planifier la maintenance",
        ]}
      >
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Conducteurs récents */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Conducteurs</p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">Derniers inscrits</h2>
                </div>
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="space-y-3">
                {drivers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun conducteur enregistré</p>
                    <Link to="/admin/taxi/drivers" className="inline-flex items-center gap-2 mt-3 text-sm text-cyan-600 hover:text-cyan-700">
                      <Plus className="h-4 w-4" />
                      Ajouter un conducteur
                    </Link>
                  </div>
                ) : (
                  drivers.slice(0, 4).map((driver: Driver) => (
                    <div key={driver.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {getInitials(driver.firstName, driver.lastName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{driver.firstName} {driver.lastName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[driver.status] || 'bg-gray-100'}`}>
                              {statusLabels[driver.status] || driver.status}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-600">{driver.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{driver.totalTrips || 0} courses</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link to="/admin/taxi/drivers" className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                  Voir tous les conducteurs
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Courses du jour */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Courses</p>
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
          </div>

          {/* Maintenance à venir */}
          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Maintenance</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">À venir</h2>
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

          {/* Actions rapides */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Gestion</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Véhicules & Conducteurs</h2>
              <div className="mt-4 space-y-3">
                <Link to="/admin/taxi/vehicles" className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Gérer les véhicules</span>
                  <Car className="h-5 w-5 text-gray-500" />
                </Link>
                <Link to="/admin/taxi/drivers" className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">Gérer les conducteurs</span>
                  <Users className="h-5 w-5 text-gray-500" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Liens rapides</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Navigation</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link to="/home#activities" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 text-center hover:bg-gray-100">
                  Accueil
                </Link>
                <Link to="/prod/dashboard" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 text-center hover:bg-gray-100">
                  Direction Générale
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ActivityDashboardFrame>
    </div>
  );
}