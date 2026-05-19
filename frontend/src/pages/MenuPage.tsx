import { motion } from "framer-motion";
import { UtensilsCrossed, Heart, Church, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function MenuPage() {
  const menuItems = [
    { category: "Entrées", items: [
      { name: "Samoussas", description: "3 pièces, garniture bœuf ou poulet", price: "5 000 Ar" },
      { name: "Salade de zébu", description: "Salade fraîche avec zébu grillé", price: "8 000 Ar" },
      { name: "Roulés de printemps", description: "Frais ou frits, sauce nuoc-mâm", price: "6 000 Ar" }
    ]},
    { category: "Plats", items: [
      { name: "Zébu grillé", description: "Pavé de zébu, frites maison, salade", price: "15 000 Ar" },
      { name: "Riz cantonais", description: "Riz sauté aux légumes, poulet, œuf", price: "12 000 Ar" },
      { name: "Poisson au citron", description: "Filet de poisson, sauce citron, riz", price: "14 000 Ar" },
      { name: "Ravitoto", description: "Feuilles de manioc pilées, viande de porc", price: "10 000 Ar" }
    ]},
    { category: "Desserts", items: [
      { name: "Fondant au chocolat", description: "Cœur coulant, glace vanille", price: "5 000 Ar" },
      { name: "Fruits de saison", description: "Assortiment de fruits frais", price: "4 000 Ar" },
      { name: "Glace artisanale", description: "Parfum au choix", price: "3 000 Ar" }
    ]},
    { category: "Boissons", items: [
      { name: "Jus naturels", description: "Ananas, mangue, citron, goyave", price: "3 000 Ar" },
      { name: "Cocktails", description: "Mojito, Punch, Sex on the beach", price: "8 000 Ar" },
      { name: "Bières locales", description: "THB, Three Horses", price: "4 000 Ar" },
      { name: "Vin", description: "Rouge, blanc, rosé", price: "12 000 Ar" }
    ]}
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-sm">Notre carte</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Menu de <span className="text-amber-300">ByGagoos CDA</span>
            </h1>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Une cuisine généreuse aux saveurs locales et internationales
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-amber-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {menuItems.map((section, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-amber-800 mb-4 border-b pb-2">{section.category}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <span className="font-bold text-amber-700 ml-4 whitespace-nowrap">{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton retour */}
          <div className="text-center mt-8">
            <Link to="/cda" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700">
              ← Retour à la page CDA
            </Link>
          </div>

          {/* Verset */}
          <div className="text-center py-12 border-t mt-12">
            <div className="inline-block bg-amber-50 px-6 md:px-8 py-4 rounded-full border border-amber-200">
              <p className="text-amber-800 italic flex items-center gap-2 md:gap-3 text-sm md:text-base">
                <Church className="h-5 w-5 text-amber-600" />
                "Goûtez et voyez comme l'Éternel est bon"
                <Heart className="h-5 w-5 text-amber-600" />
              </p>
              <p className="text-amber-600 text-xs md:text-sm mt-1">— Psaume 34:9</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}