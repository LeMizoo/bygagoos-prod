import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Plus, Search, Edit2, Trash2, Eye, X,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  RefreshCw
} from 'lucide-react';
import { stockApi } from '../../api/stock.api';
import type { StockItem, StockMovement, StockStats, CreateStockItemDto } from '../../types/restaurant';

const categoryOptions = ['Tous', 'Ingrédients', 'Boissons', 'Ustensiles', 'Nettoyage', 'Viandes', 'Légumes', 'Épicerie'];
const unitOptions = ['kg', 'g', 'L', 'mL', 'pièces', 'bouteilles', 'sachets', 'boîtes'];

export default function RestaurantStockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [stats, setStats] = useState<StockStats>({ totalItems: 0, criticalStock: 0, lowStock: 0, totalValue: 0, mostConsumed: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [showMovements, setShowMovements] = useState<StockItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [formData, setFormData] = useState<CreateStockItemDto>({
    name: '', category: 'Ingrédients', quantity: 0, unit: 'kg', minThreshold: 5, maxCapacity: 100
  });
  const [movementData, setMovementData] = useState({ type: 'IN' as 'IN' | 'OUT', quantity: 0, reason: 'PURCHASE', note: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsData, statsData] = await Promise.all([
        stockApi.getStockItems({ category: selectedCategory !== 'Tous' ? selectedCategory : undefined }),
        stockApi.getStockStats()
      ]);
      setItems(itemsData.items || []);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadMovements = async (itemId: string) => {
    const data = await stockApi.getStockMovements(itemId, 20);
    setMovements(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await stockApi.updateStockItem(editingItem.id, formData);
      } else {
        await stockApi.createStockItem(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', category: 'Ingrédients', quantity: 0, unit: 'kg', minThreshold: 5, maxCapacity: 100 });
      await loadData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Impossible de sauvegarder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await stockApi.deleteStockItem(id);
      await loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Impossible de supprimer');
    }
  };

  const handleMovement = async (itemId: string) => {
    try {
      await stockApi.createStockMovement({ itemId, ...movementData });
      setMovementData({ type: 'IN', quantity: 0, reason: 'PURCHASE', note: '' });
      await loadData();
      alert('Mouvement enregistré');
    } catch (error) {
      console.error('Erreur mouvement:', error);
      alert('Impossible d\'enregistrer le mouvement');
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name, category: item.category, quantity: item.quantity, unit: item.unit,
      minThreshold: item.minThreshold, maxCapacity: item.maxCapacity, supplier: item.supplier, notes: item.notes
    });
    setShowForm(true);
  };

  const viewMovements = async (item: StockItem) => {
    setShowMovements(item);
    await loadMovements(item.id);
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const getAlertClass = (item: StockItem) => {
    if (item.quantity <= item.minThreshold) return 'bg-red-100 text-red-800';
    if (item.quantity <= item.minThreshold * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getAlertIcon = (item: StockItem) => {
    if (item.quantity <= item.minThreshold) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (item.quantity <= item.minThreshold * 1.5) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des stocks</h1>
          <p className="text-gray-500 mt-1">Gérez les produits et ingrédients du restaurant</p>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ name: '', category: 'Ingrédients', quantity: 0, unit: 'kg', minThreshold: 5, maxCapacity: 100 }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="h-4 w-4" /> Ajouter un produit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Produits</p><p className="text-2xl font-bold">{stats.totalItems}</p></div><Package className="h-5 w-5 text-gray-400" /></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Stock critique</p><p className="text-2xl font-bold text-red-600">{stats.criticalStock}</p></div><AlertTriangle className="h-5 w-5 text-red-500" /></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Stock bas</p><p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p></div><TrendingDown className="h-5 w-5 text-yellow-500" /></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Valeur totale</p><p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} Ar</p></div><TrendingUp className="h-5 w-5 text-green-500" /></div></div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
            title="Rechercher un produit"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-xl bg-white"
          title="Catégorie"
        >
          <option value="Tous">Toutes catégories</option>
          {categoryOptions.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button onClick={loadData} className="p-2 border rounded-xl hover:bg-gray-50" title="Actualiser">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? <div className="p-8 text-center">Chargement...</div> : filteredItems.length === 0 ? <div className="p-8 text-center text-gray-500">Aucun produit trouvé</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Catégorie</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Seuil</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.supplier || 'Fournisseur non spécifié'}</p></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{item.category}</span></td>
                    <td className="px-4 py-3"><span className="font-medium">{item.quantity} {item.unit}</span></td>
                    <td className="px-4 py-3">{item.minThreshold} {item.unit}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getAlertClass(item)}`}>{getAlertIcon(item)} {item.quantity <= item.minThreshold ? (item.quantity <= 0 ? 'Rupture' : 'Critique') : item.quantity <= item.minThreshold * 1.5 ? 'Bas' : 'Normal'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => viewMovements(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Historique"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => handleEdit(item)} className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="Modifier"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suggestions réapprovisionnement */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2"><Package className="h-4 w-4" />Suggestions de réapprovisionnement</h3>
        <div className="flex flex-wrap gap-3">
          {items.filter(i => i.quantity <= i.minThreshold).slice(0, 5).map(item => (<div key={item.id} className="bg-white rounded-lg px-4 py-2 shadow-sm text-sm"><span className="font-medium">{item.name}</span><span className="text-gray-500 ml-2">{item.quantity}/{item.minThreshold} {item.unit}</span></div>))}
          {items.filter(i => i.quantity <= i.minThreshold).length === 0 && <p className="text-gray-500 text-sm">Tous les stocks sont suffisants ✅</p>}
        </div>
      </div>

      {/* Modal Mouvement */}
      {showMovements && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Mouvements - {showMovements.name}</h2>
              <button onClick={() => setShowMovements(null)} className="text-gray-400 hover:text-gray-600" title="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMovementData({ ...movementData, type: 'IN' })} className={`flex-1 py-2 rounded-lg ${movementData.type === 'IN' ? 'bg-green-600 text-white' : 'bg-gray-100'}`} title="Entrée">Entrée +</button>
              <button onClick={() => setMovementData({ ...movementData, type: 'OUT' })} className={`flex-1 py-2 rounded-lg ${movementData.type === 'OUT' ? 'bg-red-600 text-white' : 'bg-gray-100'}`} title="Sortie">Sortie -</button>
            </div>
            <input type="number" placeholder="Quantité" value={movementData.quantity} onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg p-2 mb-3" title="Quantité" />
            <select value={movementData.reason} onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })} className="w-full border rounded-lg p-2 mb-3" title="Raison">
              <option value="PURCHASE">Achat</option><option value="SALE">Vente</option><option value="WASTE">Perte</option><option value="ADJUSTMENT">Ajustement</option><option value="RETURN">Retour</option>
            </select>
            <textarea placeholder="Note (optionnel)" value={movementData.note} onChange={(e) => setMovementData({ ...movementData, note: e.target.value })} className="w-full border rounded-lg p-2 mb-4" rows={2} title="Note" />
            <button onClick={() => handleMovement(showMovements.id)} className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700">Enregistrer le mouvement</button>
            <div className="mt-4 border-t pt-4"><h3 className="font-semibold mb-2">Historique</h3><div className="space-y-2 max-h-48 overflow-y-auto">{movements.map(m => (<div key={m.id} className="flex justify-between text-sm border-b pb-2"><span className={m.type === 'IN' ? 'text-green-600' : 'text-red-600'}>{m.type === 'IN' ? '+' : '-'}{m.quantity}</span><span>{m.reason}</span><span className="text-gray-400">{new Date(m.createdAt).toLocaleString()}</span></div>))}</div></div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Modifier' : 'Ajouter'} un produit</h2>
              <button onClick={() => { setShowForm(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600" title="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Nom du produit" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2" required title="Nom du produit" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg p-2" title="Catégorie">
                {categoryOptions.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Quantité" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="border rounded-lg p-2" title="Quantité" />
                <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="border rounded-lg p-2" title="Unité">
                  {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Seuil min" value={formData.minThreshold} onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})} className="border rounded-lg p-2" title="Seuil minimum" />
                <input type="number" placeholder="Capacité max" value={formData.maxCapacity} onChange={(e) => setFormData({...formData, maxCapacity: parseInt(e.target.value) || 0})} className="border rounded-lg p-2" title="Capacité maximale" />
              </div>
              <input type="text" placeholder="Fournisseur" value={formData.supplier || ''} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full border rounded-lg p-2" title="Fournisseur" />
              <textarea placeholder="Notes" value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-2" rows={2} title="Notes" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700">{editingItem ? 'Mettre à jour' : 'Ajouter'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }} className="flex-1 border py-2 rounded-lg">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}