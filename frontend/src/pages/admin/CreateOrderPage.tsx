import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import dev from '../../utils/devLogger';
import { adminClientsApi } from "../../api/adminClients.api";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import {
  ArrowLeft,
  Save,
  ShoppingCart,
  User,
  Package,
  Calendar,
} from "lucide-react";

// Interface locale pour un client (simplifiée, correspondant à ce que l'API retourne vraiment)
interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

// Interface locale pour un design (uniquement ce dont on a besoin)
interface Design {
  _id: string;
  title: string;
  price: number;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<
    Array<{ design: Design; quantity: number }>
  >([]);
  const [formData, setFormData] = useState({
    clientId: "",
    deliveryDate: "",
    notes: "",
    status: "PENDING" as const,
    priority: "NORMAL" as const,
  });

  // Récupération des données avec extraction robuste
  useEffect(() => {
    const fetchData = async () => {
      try {
        dev.log("📦 Chargement des clients et designs...");
        const [clientsRes, designsRes] = await Promise.all([
          adminClientsApi.getAll(),
          adminDesignsApi.getAllDesigns()
        ]);
        
        const clientsArray: Client[] = (Array.isArray(clientsRes) ? clientsRes : []).map((client) => ({
          _id: client._id || client.id || '',
          name: `${client.firstName} ${client.lastName}`.trim(),
          email: client.email,
          phone: client.phone,
        }));
        setClients(clientsArray);
        
        const designsArray = designsRes.data || [];
        const normalizedDesigns = designsArray.map((design) => ({
          _id: design._id,
          title: design.title,
          price: design.basePrice || 0,
        }));
        
        setDesigns(normalizedDesigns);
        dev.log("✅ Données chargées:", { clients: clientsArray.length, designs: normalizedDesigns.length });
      } catch (error) {
        dev.error("❌ Erreur chargement données:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDesigns.length === 0) {
      alert("Veuillez ajouter au moins un design à la commande");
      return;
    }

    try {
      setLoading(true);

      const total = selectedDesigns.reduce(
        (sum, item) => sum + item.design.price * item.quantity,
        0,
      );

      const orderData = {
        clientId: formData.clientId,
        designs: selectedDesigns.map((item) => ({
          designId: item.design._id,
          quantity: item.quantity,
          unitPrice: item.design.price,
        })),
        total,
        status: formData.status,
        priority: formData.priority,
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
      };

      dev.log("Création de la commande:", orderData);

      // TODO: Appel API réel à décommenter quand disponible
      // await createOrder(orderData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Commande créée avec succès!");
      navigate("/admin/orders");
    } catch (error) {
      alert("Erreur lors de la création de la commande");
      dev.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addDesign = (designId: string) => {
    const design = designs.find((d) => d._id === designId);
    if (
      design &&
      !selectedDesigns.some((item) => item.design._id === designId)
    ) {
      setSelectedDesigns((prev) => [...prev, { design, quantity: 1 }]);
    }
  };

  const removeDesign = (designId: string) => {
    setSelectedDesigns((prev) =>
      prev.filter((item) => item.design._id !== designId),
    );
  };

  const updateQuantity = (designId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedDesigns((prev) =>
      prev.map((item) =>
        item.design._id === designId ? { ...item, quantity } : item,
      ),
    );
  };

  const calculateTotal = () => {
    return selectedDesigns.reduce(
      (sum, item) => sum + item.design.price * item.quantity,
      0,
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/orders"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Créer une nouvelle commande
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations client */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Informations client
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez un client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} - {client.email} {client.phone && `(${client.phone})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison souhaitée
                </label>
                <input
                  id="deliveryDate"
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="NORMAL">Normale</option>
                  <option value="URGENT">Urgente</option>
                  <option value="EXPRESS">Express</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Instructions spéciales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Instructions de livraison, préférences client, détails particuliers..."
              />
            </div>
          </div>
        </div>

        {/* Sélection des designs */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">
                Articles de la commande
              </h2>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Total: {calculateTotal().toLocaleString()} Ar
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="addDesign" className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter un design
              </label>
              <div className="flex space-x-4">
                <select
                  id="addDesign"
                  onChange={(e) => {
                    if (e.target.value) {
                      addDesign(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez un design à ajouter</option>
                  {designs
                    .filter(
                      (design) =>
                        !selectedDesigns.some(
                          (item) => item.design._id === design._id,
                        ),
                    )
                    .map((design) => (
                      <option key={design._id} value={design._id}>
                        {design.title} - {design.price.toLocaleString()} Ar
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {selectedDesigns.length > 0 ? (
              <div className="space-y-4">
                {selectedDesigns.map((item) => (
                  <div
                    key={item.design._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.design.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.design.price.toLocaleString()} Ar l'unité
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.design._id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.design._id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-32 text-right font-medium">
                        {(item.design.price * item.quantity).toLocaleString()} Ar
                      </div>

                      <button
                        type="button"
                        onClick={() => removeDesign(item.design._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Total de la commande
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateTotal().toLocaleString()} Ar
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun design ajouté à la commande</p>
                <p className="text-sm">
                  Sélectionnez un design dans la liste ci-dessus
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statut de la commande */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Statut de la commande
            </h2>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut initial
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="IN_PROGRESS">En production</option>
              <option value="READY_FOR_DELIVERY">Prête pour livraison</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/admin/orders"
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || selectedDesigns.length === 0}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création en cours..." : "Créer la commande"}
          </button>
        </div>
      </form>
    </div>
  );
}
