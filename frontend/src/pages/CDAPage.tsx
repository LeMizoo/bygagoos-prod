import { motion } from "framer-motion";
import { UtensilsCrossed, Wine, Coffee, Clock, Star, Heart, Church, Calendar, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function CDAPage() {
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

  const horaires = [
    { day: "Mardi - Jeudi", hours: "11h00 - 21h00", icon: Clock },
    { day: "Vendredi - Samedi", hours: "11h00 - 22h00", icon: Wine },
    { day: "Dimanche", hours: "11h00 - 20h00", icon: Coffee },
    { day: "Lundi", hours: "Fermé", icon: Clock }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // Supprimer staggerContainer qui n'était pas utilisé

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-sm">Cuisine malgache et internationale</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ByGagoos <span className="text-amber-300">CDA</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Restaurant & Bar - Une expérience culinaire unique au cœur d'Antananarivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-amber-900 px-6 py-3 rounded-full font-semibold hover:bg-amber-50 transition-all hover:scale-105"
              >
                Réserver une table
                <Calendar className="h-4 w-4" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                Voir la carte
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Atmosphère */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            {[
              { icon: Wine, title: "Bar à cocktails", desc: "Une sélection de cocktails maison et spiritueux", color: "amber" },
              { icon: Coffee, title: "Café & Desserts", desc: "Pause gourmande en journée", color: "amber" },
              { icon: Calendar, title: "Événements privés", desc: "Organisez vos soirées et anniversaires", color: "amber" }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-10 w-10 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-amber-50 rounded-3xl p-8 md:p-12 mb-20"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre carte</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Une cuisine généreuse aux saveurs locales et internationales
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {menuItems.map((section, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
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
          </motion.div>

          {/* Horaires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 mb-20"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">Horaires d'ouverture</h2>
              </div>
              <div className="space-y-3">
                {horaires.map((horaire, index) => {
                  const Icon = horaire.icon;
                  return (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-gray-700">{horaire.day}</span>
                      </div>
                      <span className="text-gray-600">{horaire.hours}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>Antananarivo, Madagascar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Phone className="h-4 w-4" />
                  <span>+261 34 43 593 30</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-8 text-center text-white flex flex-col justify-center">
              <Star className="h-12 w-12 mx-auto mb-4 fill-white" />
              <h2 className="text-2xl font-bold mb-2">Réservation recommandée</h2>
              <p className="mb-6 opacity-90">Pour les groupes de plus de 6 personnes et les week-ends</p>
              <Link
                to="/contact"
                className="bg-white text-amber-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all mx-auto inline-block hover:scale-105"
              >
                Réserver une table
              </Link>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-amber-800 to-amber-700 rounded-3xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Une soirée à prévoir ?</h2>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Contactez-nous pour organiser votre événement privé ou professionnel
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-amber-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              Nous contacter
              <Calendar className="h-4 w-4" />
            </Link>
          </motion.div>

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