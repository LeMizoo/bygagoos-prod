import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Bike, MapPin, Wrench, 
  Users, Car, Plus, Eye, Star,
  Palette, UtensilsCrossed, Crown,
  TrendingUp, DollarSign, Fuel, Calendar,
  Award, BarChart3, Clock, AlertTriangle
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";
import taxiApi from "../../api/taxi.api";

// Enregistrer Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

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
  cost?: number;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  rating: number;
  totalTrips: number;
  totalEarnings?: number;
  totalDistance?: number;
}

interface VehicleStats {
  id: string;
  licensePlate: string;
  model: string;
  totalTrips: number;
  totalDistance: number;
  totalRevenue: number;
  status: string;
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

  // Données pour les graphiques (mockées en attendant l'API)
  const weeklyTrips = [12, 18, 22, 25, 30, 35, 28];
  const weeklyRevenue = [180000, 270000, 330000, 375000, 450000, 525000, 420000];
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Classement des chauffeurs par revenus (mocké)
  const topDriversByEarnings = [
    { name: 'Rakoto Jean', earnings: 450000, trips: 48, rating: 4.9 },
    { name: 'Razafy Paul', earnings: 420000, trips: 45, rating: 4.8 },
    { name: 'Andria Marc', earnings: 380000, trips: 40, rating: 4.7 },
    { name: 'Rabe Marie', earnings: 350000, trips: 38, rating: 4.9 },
    { name: 'Randria Sophie', earnings: 310000, trips: 35, rating: 4.6 },
  ];

  // Véhicules les plus utilisés (mocké)
  const topVehicles = [
    { plate: '1234TMA', model: 'Toyota Corolla', trips: 156, revenue: 2340000, distance: 2450 },
    { plate: '5678TMA', model: 'Kia Picanto', trips: 142, revenue: 2130000, distance: 2280 },
    { plate: '9012TMA', model: 'Renault Logan', trips: 128, revenue: 1920000, distance: 2100 },
  ];

  const tripsChartData = {
    labels: weekDays,
    datasets: [{
      label: 'Courses',
      data: weeklyTrips,
      borderColor: 'rgb(6, 182, 212)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const revenueChartData = {
    labels: weekDays,
    datasets: [{
      label: 'Revenus (Ar)',
      data: weeklyRevenue,
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
  };

  const totalRevenue = topDriversByEarnings.reduce((sum, d) => sum + d.earnings, 0);
  const avgRevenuePerDriver = totalRevenue / topDriversByEarnings.length;
  const occupancyRate = ((stats?.activeVehicles || 0) / (stats?.totalVehicles || 1)) * 100;

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

  const getInitials = (firstName: string, lastName: string) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

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
          <div className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /><span className="text-sm text-gray-500">Basculer vers :</span></div>
          <div className="flex flex-wrap gap-3">
            {activityLinks.map((activity) => {
              const Icon = activity.icon;
              return (
                <Link key={activity.name} to={activity.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activity.current ? "bg-gray-100 text-gray-900 cursor-default" : `${activity.color} hover:opacity-80 hover:scale-105`}`}>
                  <Icon className="h-4 w-4" /><span className="text-sm font-medium">{activity.name}</span>
                </Link>
              );
            })}
          </div>
          <Link to="/prod/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all">
            <Crown className="h-4 w-4" /><span className="text-sm font-medium">Direction Générale</span>
          </Link>
        </div>
      </div>

      {/* KPIs améliorés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Chiffre d'affaires</p><p className="text-2xl font-bold text-gray-900">{(totalRevenue / 1000).toFixed(0)}k Ar</p></div>
            <div className="p-3 bg-green-100 rounded-xl"><DollarSign className="h-5 w-5 text-green-600" /></div>
          </div>
          <div className="flex items-center gap-1 mt-2"><TrendingUp className="h-3 w-3 text-green-500" /><span className="text-xs text-green-600">+15%</span><span className="text-xs text-gray-400">vs semaine dernière</span></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Courses</p><p className="text-2xl font-bold text-gray-900">{stats?.todayTrips || 0}</p></div>
            <div className="p-3 bg-blue-100 rounded-xl"><MapPin className="h-5 w-5 text-blue-600" /></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">aujourd'hui</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Taux occupation</p><p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(0)}%</p></div>
            <div className="p-3 bg-amber-100 rounded-xl"><BarChart3 className="h-5 w-5 text-amber-600" /></div>
          </div>
          <div className="flex items-center gap-1 mt-2"><TrendingUp className="h-3 w-3 text-green-500" /><span className="text-xs text-green-600">+8%</span><span className="text-xs text-gray-400">vs hier</span></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Conducteurs actifs</p><p className="text-2xl font-bold text-gray-900">{driversAvailable}</p></div>
            <div className="p-3 bg-purple-100 rounded-xl"><Users className="h-5 w-5 text-purple-600" /></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">sur {driversTotal} total</div>
        </div>
      </div>

      {/* Graphiques d'évolution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Évolution des courses</h2><Calendar className="h-4 w-4 text-gray-400" /></div>
          <div className="h-64"><Line data={tripsChartData} options={chartOptions} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Revenus par jour</h2><DollarSign className="h-4 w-4 text-gray-400" /></div>
          <div className="h-64"><Line data={revenueChartData} options={chartOptions} /></div>
        </div>
      </div>

      {/* Classements */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top chauffeurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" />Top chauffeurs</h2></div>
          <div className="divide-y divide-gray-100">
            {topDriversByEarnings.map((driver, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><span className="text-sm font-bold text-amber-700">{idx + 1}</span></div>
                  <div><p className="font-medium text-gray-900">{driver.name}</p><div className="flex items-center gap-2 text-xs"><span>{driver.trips} courses</span><span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />{driver.rating}</span></div></div>
                </div>
                <div className="text-right"><p className="font-semibold text-gray-900">{(driver.earnings / 1000).toFixed(0)}k Ar</p></div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100"><Link to="/admin/taxi/drivers" className="text-sm text-cyan-600 hover:text-cyan-700">Voir tous les conducteurs →</Link></div>
        </div>

        {/* Véhicules les plus actifs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Car className="h-5 w-5 text-cyan-600" />Véhicules les plus actifs</h2></div>
          <div className="divide-y divide-gray-100">
            {topVehicles.map((vehicle, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-center justify-between"><div><p className="font-medium text-gray-900">{vehicle.plate}</p><p className="text-sm text-gray-500">{vehicle.model}</p></div><div className="text-right"><p className="font-semibold text-gray-900">{vehicle.trips} courses</p><p className="text-xs text-gray-500">{(vehicle.revenue / 1000).toFixed(0)}k Ar</p></div></div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500"><Fuel className="h-3 w-3" /><span>{vehicle.distance} km</span><Clock className="h-3 w-3 ml-2" /><span>{(vehicle.distance / 30).toFixed(0)}h</span></div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100"><Link to="/admin/taxi/vehicles" className="text-sm text-cyan-600 hover:text-cyan-700">Voir tous les véhicules →</Link></div>
        </div>
      </div>

      {/* Maintenance à venir avec coût */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Maintenance à venir</h2></div>
        <div className="divide-y divide-gray-100">
          {maintenance.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucune maintenance planifiée 🔧</div>
          ) : (
            maintenance.slice(0, 3).map((item: Maintenance) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div><p className="font-medium text-gray-900">{item.type}</p><p className="text-sm text-gray-500">{item.mechanic || 'Garage partenaire'}</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-amber-700">{new Date(item.date).toLocaleDateString('fr-FR')}</p>{item.cost && <p className="text-xs text-gray-500">{item.cost.toLocaleString()} Ar</p>}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activités récentes et liens rapides */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernières courses</h2>
          <div className="space-y-3">
            {displayTrips.slice(0, 4).map((trip: Trip) => (
              <div key={trip.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <div><p className="font-semibold text-gray-900">{trip.pickupLocation} → {trip.dropLocation}</p><p className="text-sm text-gray-600">{trip.passenger}</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-gray-900">{trip.fare} Ar</p><p className="text-xs text-gray-500 uppercase">{trip.status}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid gap-3">
            <Link to="/admin/taxi/vehicles" className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"><span className="font-medium text-gray-800">Gérer les véhicules</span><Car className="h-5 w-5 text-gray-500" /></Link>
            <Link to="/admin/taxi/drivers" className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"><span className="font-medium text-gray-800">Gérer les conducteurs</span><Users className="h-5 w-5 text-gray-500" /></Link>
            <Link to="/trans#excursions" className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"><span className="font-medium text-gray-800">S'inscrire à une excursion</span><Calendar className="h-5 w-5 text-gray-500" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}