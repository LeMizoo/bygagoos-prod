import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Plus, X, Trash2,
  Clock, Phone, Mail, MapPin,
  ChevronRight, Check, AlertCircle
} from 'lucide-react';
import restaurantApi from '../../api/restaurant.api';
import toast from 'react-hot-toast';

// Interface alignée avec le fichier types/restaurant.ts
interface Reservation {
  id: string;
  name: string;           // correspond à customerName
  customerEmail?: string;
  customerPhone?: string;
  partySize?: number;
  reservationDate?: string;
  reservationTime?: string;
  specialRequests?: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  tableNumber?: number;
  notes?: string;
  time?: string;          // fallback
  table?: number;         // fallback
}

// Interface pour le formulaire
interface NewReservationForm {
  name: string;
  email: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  specialRequests: string;
  tableNumber: string;
  notes: string;
}

const statusConfig = {
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmée', icon: Check },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente', icon: Clock },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée', icon: X },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Complétée', icon: Check }
};

const mockReservations: Reservation[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    customerEmail: 'jean@example.com',
    customerPhone: '+261 34 12 345 67',
    partySize: 4,
    reservationDate: '2026-06-15',
    reservationTime: '19:00',
    specialRequests: 'Table près de la fenêtre',
    status: 'CONFIRMED',
    tableNumber: 5
  },
  {
    id: '2',
    name: 'Marie Martin',
    customerEmail: 'marie@example.com',
    customerPhone: '+261 32 98 765 43',
    partySize: 2,
    reservationDate: '2026-06-15',
    reservationTime: '20:00',
    status: 'PENDING',
  },
  {
    id: '3',
    name: 'Pierre Bernard',
    customerEmail: 'pierre@example.com',
    customerPhone: '+261 33 45 678 90',
    partySize: 6,
    reservationDate: '2026-06-16',
    reservationTime: '18:30',
    specialRequests: 'Célébration d\'anniversaire',
    status: 'CONFIRMED',
    tableNumber: 3
  }
];

export default function RestaurantReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'>('ALL');
  const [newReservation, setNewReservation] = useState<NewReservationForm>({
    name: '',
    email: '',
    phone: '',
    partySize: 2,
    date: '',
    time: '',
    specialRequests: '',
    tableNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      try {
        const data = await restaurantApi.getReservations?.();
        if (data && data.reservations) {
          // Convertir les données API au format attendu
          const formatted: Reservation[] = data.reservations.map((r: any) => ({
            id: r.id,
            name: r.name || r.customerName,
            customerEmail: r.email || r.customerEmail,
            customerPhone: r.phone || r.customerPhone,
            partySize: r.partySize,
            reservationDate: r.date || r.reservationDate,
            reservationTime: r.time || r.reservationTime,
            specialRequests: r.specialRequests,
            status: r.status,
            tableNumber: r.tableNumber || r.table,
            notes: r.notes
          }));
          setReservations(formatted);
        } else {
          setReservations(mockReservations);
        }
      } catch {
        setReservations(mockReservations);
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      setReservations(mockReservations);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReservation = async () => {
    if (!newReservation.name || !newReservation.date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const reservation: Reservation = {
        id: Date.now().toString(),
        name: newReservation.name,
        customerEmail: newReservation.email,
        customerPhone: newReservation.phone,
        partySize: newReservation.partySize,
        reservationDate: newReservation.date,
        reservationTime: newReservation.time,
        specialRequests: newReservation.specialRequests,
        tableNumber: newReservation.tableNumber ? parseInt(newReservation.tableNumber) : undefined,
        status: 'PENDING'
      };
      setReservations(prev => [...prev, reservation]);
      toast.success('Réservation ajoutée');
      setShowModal(false);
      setNewReservation({
        name: '',
        email: '',
        phone: '',
        partySize: 2,
        date: '',
        time: '',
        specialRequests: '',
        tableNumber: '',
        notes: ''
      });
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      toast.success('Réservation annulée');
      setSelectedReservation(null);
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const updateReservationStatus = async (reservationId: string, status: Reservation['status']) => {
    try {
      setReservations(prev =>
        prev.map(r => r.id === reservationId ? { ...r, status } : r)
      );
      toast.success('Réservation mise à jour');
      setSelectedReservation(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredReservations = filterStatus === 'ALL'
    ? reservations
    : reservations.filter(r => r.status === filterStatus);

  const upcomingCount = reservations.filter(r => r.status === 'CONFIRMED').length;
  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
  const totalPartySize = reservations
    .filter(r => r.status === 'CONFIRMED')
    .reduce((sum, r) => sum + (r.partySize || 0), 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-500 mt-1">Gestion des réservations du restaurant</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          title="Nouvelle réservation"
        >
          <Plus className="h-4 w-4" />
          Nouvelle réservation
        </motion.button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Réservations confirmées</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente de confirmation</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Couverts confirmés</p>
              <p className="text-2xl font-bold text-gray-900">{totalPartySize}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'] as const).map(status => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === status
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300'
            }`}
            title={`Filtrer par ${status === 'ALL' ? 'toutes les réservations' : statusConfig[status as keyof typeof statusConfig]?.label}`}
          >
            {status === 'ALL' ? 'Toutes' : statusConfig[status as keyof typeof statusConfig]?.label}
          </motion.button>
        ))}
      </div>

      {/* Liste des réservations */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredReservations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune réservation trouvée</p>
            </motion.div>
          ) : (
            filteredReservations.map(reservation => {
              const statusConfig_ = statusConfig[reservation.status];
              const StatusIcon = statusConfig_.icon;
              return (
                <motion.div
                  key={reservation.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  onClick={() => setSelectedReservation(reservation)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{reservation.name}</h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${statusConfig_.bg} ${statusConfig_.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig_.label}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {reservation.reservationDate ? new Date(reservation.reservationDate).toLocaleDateString('fr-FR') : 'À définir'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {reservation.reservationTime || reservation.time || 'À définir'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {reservation.partySize || 2} couverts
                        </div>
                        {reservation.tableNumber && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Table {reservation.tableNumber}
                          </div>
                        )}
                      </div>
                      {reservation.specialRequests && (
                        <p className="text-xs text-gray-500 mt-2">📝 {reservation.specialRequests}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReservation(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedReservation.name}</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Heure</label>
                  <p className="text-gray-900">
                    {selectedReservation.reservationDate ? new Date(selectedReservation.reservationDate).toLocaleDateString('fr-FR') : 'À définir'} à {selectedReservation.reservationTime || selectedReservation.time || 'À définir'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedReservation.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedReservation.customerEmail}
                      </div>
                    )}
                    {selectedReservation.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedReservation.customerPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couverts</label>
                  <p className="text-gray-900">{selectedReservation.partySize || 2}</p>
                </div>
                {selectedReservation.specialRequests && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demandes spéciales</label>
                    <p className="text-gray-900">{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateReservationStatus(selectedReservation.id, 'CONFIRMED')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  title="Confirmer la réservation"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => updateReservationStatus(selectedReservation.id, 'CANCELLED')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  title="Annuler la réservation"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteReservation(selectedReservation.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  title="Supprimer la réservation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nouvelle réservation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Nouvelle réservation</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newReservation.name}
                    onChange={e => setNewReservation({...newReservation, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Jean Dupont"
                    title="Nom du client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newReservation.email}
                    onChange={e => setNewReservation({...newReservation, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="jean@example.com"
                    title="Email du client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={newReservation.phone}
                    onChange={e => setNewReservation({...newReservation, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+261 34 12 345 67"
                    title="Téléphone du client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newReservation.date}
                    onChange={e => setNewReservation({...newReservation, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    title="Date de réservation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input
                    type="time"
                    value={newReservation.time}
                    onChange={e => setNewReservation({...newReservation, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    title="Heure de réservation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de couverts</label>
                  <input
                    type="number"
                    min="1"
                    value={newReservation.partySize}
                    onChange={e => setNewReservation({...newReservation, partySize: parseInt(e.target.value) || 2})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    title="Nombre de couverts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de table</label>
                  <input
                    type="number"
                    value={newReservation.tableNumber}
                    onChange={e => setNewReservation({...newReservation, tableNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Optionnel"
                    title="Numéro de table (optionnel)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demandes spéciales</label>
                  <textarea
                    value={newReservation.specialRequests}
                    onChange={e => setNewReservation({...newReservation, specialRequests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Régime alimentaire, célébration, etc."
                    rows={3}
                    title="Demandes spéciales"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  title="Annuler"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddReservation}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  title="Ajouter la réservation"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}