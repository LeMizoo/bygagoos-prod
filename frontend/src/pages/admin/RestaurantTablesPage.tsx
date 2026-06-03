import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table, Users, Plus, X, Trash2,
  Clock, UtensilsCrossed,
  Grid3x3, LayoutGrid, Maximize2, Minimize2, RotateCw
} from 'lucide-react';
import restaurantApi from '../../api/restaurant.api';
import toast from 'react-hot-toast';

interface TableItem {
  id: string;
  number: number;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  position: { x: number; y: number };
  shape: 'round' | 'square' | 'rectangle';
  reservation?: {
    customerName: string;
    time: string;
    partySize: number;
  };
}

const statusColors = {
  FREE: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', label: 'Libre' },
  OCCUPIED: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', label: 'Occupée' },
  RESERVED: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', label: 'Réservée' },
  MAINTENANCE: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700', label: 'Maintenance' }
};

const shapeStyles = {
  round: 'rounded-full',
  square: 'rounded-lg',
  rectangle: 'rounded-xl'
};

export default function RestaurantTablesPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'canvas'>('grid');
  const [editForm, setEditForm] = useState({
    number: 0,
    capacity: 2,
    shape: 'square' as TableItem['shape']
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await restaurantApi.getTables();
      const apiTables = data.tables || [];
      // Convertir les tables de l'API au format TableItem
      const formattedTables: TableItem[] = apiTables.map((table: { id: string; number: number; capacity: number; status: string }, index: number) => ({
        id: table.id || `table-${index}`,
        number: table.number || index + 1,
        capacity: table.capacity || 2,
        status: (table.status === 'FREE' || table.status === 'OCCUPIED' || table.status === 'RESERVED' || table.status === 'MAINTENANCE') 
          ? table.status as TableItem['status'] 
          : 'FREE',
        position: { x: 50 + (index % 4) * 120, y: 50 + Math.floor(index / 4) * 120 },
        shape: 'square',
        reservation: undefined
      }));
      setTables(formattedTables.length > 0 ? formattedTables : mockTables);
    } catch (error) {
      console.error('Erreur chargement tables:', error);
      setTables(mockTables);
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: TableItem['status']) => {
    try {
      await restaurantApi.updateTableStatus(tableId, status);
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
      toast.success('Table mise à jour');
      setSelectedTable(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAddTable = async () => {
    if (!editForm.number || editForm.number <= 0) {
      toast.error('Veuillez entrer un numéro de table valide');
      return;
    }
    if (tables.some(t => t.number === editForm.number)) {
      toast.error('Ce numéro de table existe déjà');
      return;
    }
    try {
      const newTable: TableItem = {
        id: Date.now().toString(),
        number: editForm.number,
        capacity: editForm.capacity,
        status: 'FREE',
        shape: editForm.shape,
        position: { x: 100 + (tables.length % 4) * 120, y: 100 + Math.floor(tables.length / 4) * 120 }
      };
      setTables(prev => [...prev, newTable]);
      toast.success('Table ajoutée');
      setShowModal(false);
      setEditForm({ number: 0, capacity: 2, shape: 'square' });
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Supprimer cette table ?')) return;
    try {
      setTables(prev => prev.filter(t => t.id !== tableId));
      toast.success('Table supprimée');
      setSelectedTable(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const updateTablePosition = (tableId: string, x: number, y: number) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, position: { x, y } } : t));
  };

  const TableCard = ({ table }: { table: TableItem }) => {
    const colors = statusColors[table.status];
    const shapeClass = shapeStyles[table.shape];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className={`relative cursor-pointer ${shapeClass} ${colors.bg} ${colors.border} border-2 p-4 min-w-[120px] transition-all shadow-sm hover:shadow-md`}
        onClick={() => setSelectedTable(table)}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Table className={`h-5 w-5 ${colors.text}`} />
            <span className={`text-lg font-bold ${colors.text}`}>#{table.number}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <Users className="h-3 w-3" />
            <span>{table.capacity} pers.</span>
          </div>
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} font-medium`}>
              {colors.label}
            </span>
          </div>
        </div>
        {table.reservation && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-amber-500 text-white rounded-full p-1 text-xs">
              <Clock className="h-3 w-3" />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-amber-600" />
            Plan des tables
          </h1>
          <p className="text-gray-500 mt-1">Gérez l'occupation et les réservations des tables</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}
              title="Vue grille"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="text-sm">Grille</span>
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'canvas' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}
              title="Vue plan"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-sm">Plan</span>
            </button>
          </div>
          <button
            onClick={() => {
              setEditForm({ number: tables.length + 1, capacity: 2, shape: 'square' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all"
            title="Ajouter une table"
          >
            <Plus className="h-4 w-4" />
            Ajouter une table
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm border">
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${colors.bg} border ${colors.border}`}></div>
            <span className={`text-sm ${colors.text}`}>{colors.label}</span>
          </div>
        ))}
      </div>

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {tables.map(table => (
                <TableCard key={table.id} table={table} />
              ))}
            </AnimatePresence>
          </div>
          {tables.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune table. Cliquez sur "Ajouter une table" pour commencer.
            </div>
          )}
        </div>
      )}

      {/* Vue Canvas */}
      {viewMode === 'canvas' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Plan du restaurant</h3>
            <div className="flex gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 border rounded hover:bg-gray-50" title="Dézoomer">
                <Minimize2 className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-500">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 border rounded hover:bg-gray-50" title="Zoomer">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button onClick={() => setZoom(1)} className="p-1 border rounded hover:bg-gray-50" title="Réinitialiser le zoom">
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            className="relative bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 min-h-[500px] overflow-auto"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {tables.map(table => {
              const colors = statusColors[table.status];
              const shapeClass = shapeStyles[table.shape];
              return (
                <motion.div
                  key={table.id}
                  drag
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    const newX = (table.position?.x || 50) + info.offset.x;
                    const newY = (table.position?.y || 50) + info.offset.y;
                    updateTablePosition(table.id, Math.max(10, Math.min(800, newX)), Math.max(10, Math.min(600, newY)));
                  }}
                  className={`absolute cursor-move ${shapeClass} ${colors.bg} ${colors.border} border-2 p-2 w-24 text-center shadow-sm hover:shadow-md transition-all`}
                  style={{ left: table.position?.x || 50, top: table.position?.y || 50 }}
                  whileDrag={{ scale: 1.05, opacity: 0.8 }}
                  onClick={() => setSelectedTable(table)}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Table className={`h-3 w-3 ${colors.text}`} />
                      <span className={`text-sm font-bold ${colors.text}`}>#{table.number}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Users className="h-2 w-2" />
                      <span>{table.capacity}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">💡 Astuce : Déplacez les tables pour organiser votre plan d'étage</p>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Tables libres</p>
          <p className="text-2xl font-bold text-green-700">{tables.filter(t => t.status === 'FREE').length}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-600 font-medium">Tables occupées</p>
          <p className="text-2xl font-bold text-red-700">{tables.filter(t => t.status === 'OCCUPIED').length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Réservations</p>
          <p className="text-2xl font-bold text-yellow-700">{tables.filter(t => t.status === 'RESERVED').length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-600 font-medium">Capacité totale</p>
          <p className="text-2xl font-bold text-amber-700">{tables.reduce((sum, t) => sum + t.capacity, 0)}</p>
        </div>
      </div>

      {/* Modal Détails Table */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Table className="h-5 w-5 text-amber-600" />
                Table #{selectedTable.number}
              </h2>
              <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-gray-600" title="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(statusColors).map(([status, colors]) => (
                    <button
                      key={status}
                      onClick={() => updateTableStatus(selectedTable.id, status as TableItem['status'])}
                      className={`px-3 py-2 rounded-lg text-sm ${colors.bg} ${colors.text} hover:opacity-80`}
                      title={`Changer le statut en ${colors.label}`}
                    >
                      {colors.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTable.reservation && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="font-medium text-yellow-800">Réservation</p>
                  <p className="text-sm">Client : {selectedTable.reservation.customerName}</p>
                  <p className="text-sm">Heure : {selectedTable.reservation.time}</p>
                  <p className="text-sm">Personnes : {selectedTable.reservation.partySize}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDeleteTable(selectedTable.id)}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                  title="Supprimer la table"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Ajout Table */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter une table</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600" title="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input
                  type="number"
                  value={editForm.number}
                  onChange={(e) => setEditForm({ ...editForm, number: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg p-2"
                  placeholder="Numéro de la table"
                  min="1"
                  title="Numéro de la table"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (personnes)</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 2 })}
                  className="w-full border rounded-lg p-2"
                  min="1"
                  max="20"
                  title="Capacité de la table"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forme</label>
                <div className="flex gap-3">
                  {(['square', 'round', 'rectangle'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => setEditForm({ ...editForm, shape })}
                      className={`flex-1 py-2 rounded-lg border transition-all ${editForm.shape === shape ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200'}`}
                      title={`Forme ${shape === 'square' ? 'carrée' : shape === 'round' ? 'ronde' : 'rectangulaire'}`}
                    >
                      {shape === 'square' && 'Carrée'}
                      {shape === 'round' && 'Ronde'}
                      {shape === 'rectangle' && 'Rectangulaire'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddTable} className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 mt-4">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const mockTables: TableItem[] = [
  { id: '1', number: 1, capacity: 2, status: 'FREE', position: { x: 50, y: 50 }, shape: 'square' },
  { id: '2', number: 2, capacity: 2, status: 'OCCUPIED', position: { x: 200, y: 50 }, shape: 'square',
    reservation: { customerName: 'Jean Rakoto', time: '12:30', partySize: 2 } },
  { id: '3', number: 3, capacity: 4, status: 'RESERVED', position: { x: 350, y: 50 }, shape: 'round',
    reservation: { customerName: 'Marie Andria', time: '13:00', partySize: 4 } },
  { id: '4', number: 4, capacity: 4, status: 'FREE', position: { x: 500, y: 50 }, shape: 'square' },
  { id: '5', number: 5, capacity: 6, status: 'FREE', position: { x: 125, y: 200 }, shape: 'rectangle' },
  { id: '6', number: 6, capacity: 6, status: 'OCCUPIED', position: { x: 275, y: 200 }, shape: 'rectangle' },
  { id: '7', number: 7, capacity: 8, status: 'RESERVED', position: { x: 425, y: 200 }, shape: 'round',
    reservation: { customerName: 'Famille Razafy', time: '19:00', partySize: 8 } },
  { id: '8', number: 8, capacity: 2, status: 'MAINTENANCE', position: { x: 575, y: 200 }, shape: 'square' },
];