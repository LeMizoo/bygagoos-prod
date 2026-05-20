import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UtensilsCrossed, Calendar, Users, Clock,
  Plus, Eye, Table, Coffee, Star
} from 'lucide-react';
import restaurantApi from '../../api/restaurant.api';

export default function RestaurantDashboardPage() {
  const [stats, setStats] = useState({
    totalTables: 0,
    occupiedTables: 0,
    todayReservations: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await restaurantApi.getRestaurantStats();
        setStats(data);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ByGagoos CDA</h1>
          <p className="text-gray-500 mt-1">Cuisine, Dégustation, Accueil</p>
        </div>
        <Link
          to="/contact"
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle réservation
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tables</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Table className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-amber-600">{stats.occupiedTables} occupées</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Réservations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayReservations}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600">pour aujourd'hui</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taux d'occupation</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Coffee className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">moyenne du jour</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Note client</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600">⭐⭐⭐⭐⭐</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Gestion</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <Link to="/contact" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Réservations</span>
              </div>
              <span className="text-sm text-gray-500">{stats.todayReservations} aujourd'hui</span>
            </Link>
            <Link to="/menu" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Menu</span>
              </div>
              <Eye className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Liens utiles</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link to="/cda" className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <span className="font-medium text-amber-700">Voir la page publique</span>
              <Eye className="h-4 w-4 text-amber-600" />
            </Link>
            <Link to="/menu" className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <span className="font-medium text-amber-700">Voir la carte</span>
              <UtensilsCrossed className="h-4 w-4 text-amber-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}