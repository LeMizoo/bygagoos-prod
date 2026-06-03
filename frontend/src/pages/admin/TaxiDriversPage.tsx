import { useState, useEffect } from 'react';
import { 
  Users, Phone, Mail, Star, Plus, Search, 
  Edit2, Trash2, Eye, X, CheckCircle, Clock, AlertCircle,
  Car, Award, TrendingUp
} from 'lucide-react';
import { Driver, DriverStatus, LicenseType, CreateDriverDto } from '../../types/taxi';
import taxiApi from '../../api/taxi.api';
import dev from '../../utils/devLogger';

const statusLabels: Record<DriverStatus, string> = {
  AVAILABLE: 'Disponible',
  ON_DUTY: 'En service',
  OFF_DUTY: 'Hors service',
  SUSPENDED: 'Suspendu'
};

const statusColors: Record<DriverStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ON_DUTY: 'bg-blue-100 text-blue-800',
  OFF_DUTY: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800'
};

const licenseLabels: Record<LicenseType, string> = {
  A: 'Permis A (Moto)',
  A1: 'Permis A1 (-125cc)',
  A2: 'Permis A2 (-35kW)',
  B: 'Permis B (Auto)'
};

// Type pour les top drivers
interface TopDriver {
  firstName: string;
  lastName: string;
  totalTrips: number;
  rating: number;
}

export default function TaxiDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState({
    total: 0, available: 0, onDuty: 0, offDuty: 0, suspended: 0, avgRating: 0, topDrivers: [] as TopDriver[]
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<CreateDriverDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseType: 'A',
    experienceYears: 0,
    status: 'AVAILABLE'
  });

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const [list, statsData] = await Promise.all([
        taxiApi.getDrivers({ limit: 100 }),
        taxiApi.getDriverStats()
      ]);
      setDrivers(list.drivers || []);
      setStats({
        total: statsData.total || 0,
        available: statsData.available || 0,
        onDuty: statsData.onDuty || 0,
        offDuty: statsData.offDuty || 0,
        suspended: statsData.suspended || 0,
        avgRating: statsData.avgRating || 0,
        topDrivers: statsData.topDrivers || []
      });
    } catch (error) {
      dev.error('Erreur chargement conducteurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await taxiApi.updateDriver(editingDriver.id, formData);
      } else {
        await taxiApi.createDriver(formData);
      }
      setShowForm(false);
      setEditingDriver(null);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        licenseNumber: '', licenseType: 'A', experienceYears: 0, status: 'AVAILABLE'
      });
      await loadDrivers();
    } catch (error) {
      dev.error('Erreur sauvegarde:', error);
      alert('Impossible de sauvegarder le conducteur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce conducteur ?')) return;
    try {
      await taxiApi.deleteDriver(id);
      await loadDrivers();
    } catch (error) {
      dev.error('Erreur suppression:', error);
      alert('Impossible de supprimer le conducteur');
    }
  };

  const handleStatusChange = async (id: string, status: DriverStatus) => {
    try {
      await taxiApi.updateDriverStatus(id, status);
      await loadDrivers();
    } catch (error) {
      dev.error('Erreur mise à jour statut:', error);
      alert('Impossible de mettre à jour le statut');
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      experienceYears: driver.experienceYears,
      status: driver.status,
      notes: driver.notes
    });
    setShowForm(true);
  };

  const filteredDrivers = drivers.filter(driver =>
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    driver.email.toLowerCase().includes(search.toLowerCase()) ||
    driver.phone.includes(search) ||
    driver.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper pour obtenir le libellé du véhicule
  const getVehicleLabel = (vehicleId: string | { licensePlate: string; model: string } | undefined): string => {
    if (!vehicleId) return 'Non assigné';
    if (typeof vehicleId === 'object') {
      return vehicleId.licensePlate || 'Assigné';
    }
    return 'Assigné';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conducteurs Taxi-Moto</h1>
          <p className="text-gray-500">Gérez les conducteurs de la flotte ByGagoos Trans</p>
        </div>
        <button
          onClick={() => {
            setEditingDriver(null);
            setFormData({
              firstName: '', lastName: '', email: '', phone: '',
              licenseNumber: '', licenseType: 'A', experienceYears: 0, status: 'AVAILABLE'
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter un conducteur
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg"><Users className="h-5 w-5 text-cyan-600" /></div>
            <div><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Disponibles</p><p className="text-2xl font-bold">{stats.available}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">En service</p><p className="text-2xl font-bold">{stats.onDuty}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><AlertCircle className="h-5 w-5 text-gray-600" /></div>
            <div><p className="text-sm text-gray-500">Hors service</p><p className="text-2xl font-bold">{stats.offDuty}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Star className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-500">Note moy.</p><p className="text-2xl font-bold">{stats.avgRating?.toFixed(1) || 0}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Top conducteurs</p><p className="text-2xl font-bold">{stats.topDrivers?.length || 0}</p></div>
          </div>
        </div>
      </div>

      {stats.topDrivers && stats.topDrivers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-cyan-50 rounded-xl p-4 border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            Meilleurs conducteurs
          </h3>
          <div className="flex flex-wrap gap-4">
            {stats.topDrivers.map((driver: TopDriver, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-700">{idx + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{driver.firstName} {driver.lastName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{driver.totalTrips} courses</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{driver.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un conducteur (nom, email, téléphone, permis)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Chargement des conducteurs...</div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun conducteur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Conducteur</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Permis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Véhicule</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Courses</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Note</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {getInitials(driver.firstName, driver.lastName)}
                        </div>
                        <div>
                          <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                          <p className="text-xs text-gray-500">{driver.experienceYears} ans d'expérience</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" /> {driver.email}</p>
                      <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> {driver.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono">{driver.licenseNumber}</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">{licenseLabels[driver.licenseType]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Car className="h-3 w-3 text-gray-400" />
                        <span>{getVehicleLabel(driver.vehicleId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={driver.status}
                        onChange={(e) => handleStatusChange(driver.id, e.target.value as DriverStatus)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${statusColors[driver.status]}`}
                        title="Statut du conducteur"
                        aria-label="Statut du conducteur"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">{driver.totalTrips}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{driver.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setViewingDriver(driver)} 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                          title="Voir les détails"
                          aria-label="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(driver)} 
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded" 
                          title="Modifier le conducteur"
                          aria-label="Modifier le conducteur"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(driver.id)} 
                          className="p-1 text-red-600 hover:bg-red-50 rounded" 
                          title="Supprimer le conducteur"
                          aria-label="Supprimer le conducteur"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingDriver ? 'Modifier' : 'Ajouter'} un conducteur</h2>
              <button onClick={() => { setShowForm(false); setEditingDriver(null); }} className="p-1 hover:bg-gray-100 rounded" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Prénom" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="border rounded-lg p-2" required />
                <input type="text" placeholder="Nom" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="border rounded-lg p-2" required />
              </div>
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-2" required />
              <input type="tel" placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg p-2" required />
              <input type="text" placeholder="Numéro de permis" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} className="w-full border rounded-lg p-2" required />
              <select 
                value={formData.licenseType} 
                onChange={(e) => setFormData({...formData, licenseType: e.target.value as LicenseType})} 
                className="w-full border rounded-lg p-2"
                title="Type de permis"
                aria-label="Type de permis"
              >
                <option value="A">Permis A (Moto)</option>
                <option value="A1">Permis A1 (-125cc)</option>
                <option value="A2">Permis A2 (-35kW)</option>
                <option value="B">Permis B (Auto)</option>
              </select>
              <input type="number" placeholder="Années d'expérience" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})} className="w-full border rounded-lg p-2" />
              <textarea placeholder="Notes (optionnel)" value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full border rounded-lg p-2" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700">
                  {editingDriver ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDriver(null); }} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {viewingDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails du conducteur</h2>
              <button onClick={() => setViewingDriver(null)} className="p-1 hover:bg-gray-100 rounded" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 pb-3 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(viewingDriver.firstName, viewingDriver.lastName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewingDriver.firstName} {viewingDriver.lastName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[viewingDriver.status]}`}>
                    {statusLabels[viewingDriver.status]}
                  </span>
                </div>
              </div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{viewingDriver.email}</p></div>
              <div><p className="text-sm text-gray-500">Téléphone</p><p className="font-medium">{viewingDriver.phone}</p></div>
              <div><p className="text-sm text-gray-500">Permis</p><p className="font-medium">{viewingDriver.licenseNumber} ({licenseLabels[viewingDriver.licenseType]})</p></div>
              <div><p className="text-sm text-gray-500">Expérience</p><p className="font-medium">{viewingDriver.experienceYears} ans</p></div>
              <div><p className="text-sm text-gray-500">Courses totales</p><p className="font-medium">{viewingDriver.totalTrips}</p></div>
              <div><p className="text-sm text-gray-500">Note moyenne</p><div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /><span className="font-medium">{viewingDriver.rating.toFixed(1)}</span></div></div>
              {viewingDriver.notes && <div><p className="text-sm text-gray-500">Notes</p><p className="text-sm">{viewingDriver.notes}</p></div>}
              {viewingDriver.emergencyContact && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold">Contact d'urgence</p>
                  <p className="text-sm">{viewingDriver.emergencyContact.name} - {viewingDriver.emergencyContact.relationship}</p>
                  <p className="text-sm">{viewingDriver.emergencyContact.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}