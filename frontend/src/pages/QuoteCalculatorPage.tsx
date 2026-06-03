import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shirt, Package, Sparkles, 
  Calculator, ShoppingBag, TrendingUp,
  Heart, Church
} from 'lucide-react';

interface QuoteParams {
  productType: string;
  quantity: number;
  colors: number;
  positions: number;
  hasDesign: boolean;
  isUrgent: boolean;
  hasPackaging: boolean;
}

const productTypes = [
  { id: 'tshirt', name: 'T-shirt', basePrice: 5000, icon: Shirt },
  { id: 'sweat', name: 'Sweat / Hoodie', basePrice: 15000, icon: Shirt },
  { id: 'totebag', name: 'Tote bag', basePrice: 4000, icon: Package },
  { id: 'cap', name: 'Casquette', basePrice: 6000, icon: Package },
];

const colorPrices = [
  { colors: 1, price: 0 },
  { colors: 2, price: 1500 },
  { colors: 3, price: 3000 },
  { colors: 4, price: 5000 },
  { colors: 5, price: 7000 },
  { colors: 6, price: 9000 },
];

const quantityDiscounts = [
  { min: 10, discount: 0 },
  { min: 25, discount: 5 },
  { min: 50, discount: 10 },
  { min: 100, discount: 15 },
  { min: 200, discount: 20 },
  { min: 500, discount: 25 },
];

export default function QuoteCalculatorPage() {
  const [params, setParams] = useState<QuoteParams>({
    productType: 'tshirt',
    quantity: 10,
    colors: 1,
    positions: 1,
    hasDesign: false,
    isUrgent: false,
    hasPackaging: false,
  });

  const [showForm, setShowForm] = useState(false);

  const selectedProduct = productTypes.find(p => p.id === params.productType);
  const basePrice = selectedProduct?.basePrice || 5000;
  
  const colorPrice = colorPrices.find(c => c.colors === params.colors)?.price || 0;
  const positionPrice = params.positions === 2 ? 3000 : 0;
  const designPrice = params.hasDesign ? 15000 : 0;
  const urgentPrice = params.isUrgent ? basePrice * 0.3 : 0;
  const packagingPrice = params.hasPackaging ? basePrice * 0.15 : 0;

  const unitPrice = basePrice + colorPrice + positionPrice + (designPrice / params.quantity) + urgentPrice + packagingPrice;
  
  const discount = quantityDiscounts.find(d => params.quantity >= d.min)?.discount || 0;
  const discountedUnitPrice = unitPrice * (1 - discount / 100);
  const totalPrice = discountedUnitPrice * params.quantity;

  const handleChange = (field: keyof QuoteParams, value: number | string | boolean) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Demande de devis envoyée !\nTotal estimé : ${Math.round(totalPrice).toLocaleString()} Ar\nNous vous contacterons sous 48h.`);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Calculator className="h-4 w-4" />
              <span className="text-sm">Estimation en temps réel</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Calculateur de <span className="text-purple-300">devis</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Estimez le prix de votre commande de sérigraphie en quelques clics.
              Ajustez les paramètres et obtenez un devis instantané.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres de votre commande</h2>
              
              <div className="space-y-6">
                {/* Type de produit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type de produit</label>
                  <div className="grid grid-cols-2 gap-3">
                    {productTypes.map(product => {
                      const Icon = product.icon;
                      const isSelected = params.productType === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleChange('productType', product.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50 text-purple-700' 
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                          title={product.name}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{product.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      value={params.quantity}
                      onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      title="Quantité"
                    />
                    <input
                      type="number"
                      value={params.quantity}
                      onChange={(e) => handleChange('quantity', Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 px-3 py-2 border rounded-lg text-center"
                      title="Quantité"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {params.quantity >= 100 && <span className="text-green-600">✅ Prix dégressif à partir de {params.quantity} pièces</span>}
                  </div>
                </div>

                {/* Nombre de couleurs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de couleurs</label>
                  <div className="flex flex-wrap gap-2">
                    {colorPrices.map(color => (
                      <button
                        key={color.colors}
                        onClick={() => handleChange('colors', color.colors)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          params.colors === color.colors
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        title={`${color.colors} couleur${color.colors > 1 ? 's' : ''}`}
                      >
                        {color.colors} couleur{color.colors > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Positions d'impression */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Positions d'impression</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleChange('positions', 1)}
                      className={`flex-1 py-3 rounded-lg border transition-all ${
                        params.positions === 1
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      title="Recto seul"
                    >
                      Recto seul
                    </button>
                    <button
                      onClick={() => handleChange('positions', 2)}
                      className={`flex-1 py-3 rounded-lg border transition-all ${
                        params.positions === 2
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      title="Recto + Verso"
                    >
                      Recto + Verso
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Création de design</p>
                        <p className="text-sm text-gray-500">Nous créons votre visuel sur mesure</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={params.hasDesign}
                      onChange={(e) => handleChange('hasDesign', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      title="Création de design"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Production urgente</p>
                        <p className="text-sm text-gray-500">Livraison en 3-5 jours (supplément 30%)</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={params.isUrgent}
                      onChange={(e) => handleChange('isUrgent', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      title="Production urgente"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-gray-900">Packaging personnalisé</p>
                        <p className="text-sm text-gray-500">Emballage sur mesure pour vos produits</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={params.hasPackaging}
                      onChange={(e) => handleChange('hasPackaging', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      title="Packaging personnalisé"
                    />
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Résultat */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Estimation du devis
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span>Prix unitaire de base</span>
                    <span className="font-semibold">{basePrice.toLocaleString()} Ar</span>
                  </div>
                  {colorPrice > 0 && (
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span>Supplément couleurs (+{params.colors}c)</span>
                      <span>{colorPrice.toLocaleString()} Ar</span>
                    </div>
                  )}
                  {positionPrice > 0 && (
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span>Impression recto/verso</span>
                      <span>{positionPrice.toLocaleString()} Ar</span>
                    </div>
                  )}
                  {params.hasDesign && (
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span>Création de design</span>
                      <span>{designPrice.toLocaleString()} Ar</span>
                    </div>
                  )}
                  {params.isUrgent && (
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span>Supplément urgent</span>
                      <span>{urgentPrice.toLocaleString()} Ar</span>
                    </div>
                  )}
                  {params.hasPackaging && (
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span>Packaging personnalisé</span>
                      <span>{packagingPrice.toLocaleString()} Ar</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-white/20 pb-2 pt-2">
                    <span>Remise quantité (-{discount}%)</span>
                    <span className="text-green-300">-{(unitPrice * discount / 100).toLocaleString()} Ar</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Prix unitaire TTC</span>
                    <span className="text-2xl font-bold">{Math.round(discountedUnitPrice).toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20">
                    <span className="text-xl font-semibold">Total TTC</span>
                    <span className="text-3xl font-bold">{Math.round(totalPrice).toLocaleString()} Ar</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 bg-white text-purple-700 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Demander ce devis
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Informations
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Délai standard : 7-10 jours ouvrés</li>
                  <li>✓ Frais de création offerts dès 50 pièces</li>
                  <li>✓ Livraison à Antananarivo possible</li>
                  <li>✓ Paiement sécurisé (MVola, virement)</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Formulaire de demande de devis */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Demande de devis</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" title="Fermer">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Nom complet" className="w-full border rounded-lg p-2" required title="Nom complet" />
                  <input type="email" placeholder="Email" className="w-full border rounded-lg p-2" required title="Email" />
                  <input type="tel" placeholder="Téléphone" className="w-full border rounded-lg p-2" title="Téléphone" />
                  <textarea placeholder="Message (optionnel)" rows={3} className="w-full border rounded-lg p-2" title="Message" />
                  <div className="bg-purple-50 p-3 rounded-lg text-sm">
                    <p className="font-medium">Récapitulatif de votre commande :</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {params.quantity} x {selectedProduct?.name} · {params.colors} couleur(s) · {params.positions} position(s)
                      {params.hasDesign && ' · Création design'}
                      {params.isUrgent && ' · Urgent'}
                      {params.hasPackaging && ' · Packaging'}
                    </p>
                    <p className="text-sm font-bold mt-2">Total estimé : {Math.round(totalPrice).toLocaleString()} Ar</p>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                    Envoyer la demande
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Verset */}
          <div className="text-center py-12 border-t mt-12">
            <div className="inline-block bg-amber-50 px-6 md:px-8 py-4 rounded-full border border-amber-200">
              <p className="text-amber-800 italic flex items-center gap-2 md:gap-3 text-sm md:text-base">
                <Church className="h-5 w-5 text-amber-600" />
                "Que vos œuvres soient faites avec amour et excellence"
                <Heart className="h-5 w-5 text-amber-600" />
              </p>
              <p className="text-amber-600 text-xs md:text-sm mt-1">— Colossiens 3:23</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}