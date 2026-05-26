import { motion } from "framer-motion";
import { UtensilsCrossed, Wine, Coffee, Clock, Star, Heart, Church, Calendar, Phone, MapPin, ChefHat, Users, Sparkles, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function CDAPage() {
  const [activeTab, setActiveTab] = useState("menu");

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

  const cdaImages = [
    "/placeholders/cda/plat1.jpg",
    "/placeholders/cda/plat2.jpg",
    "/placeholders/cda/plat3.jpg",
    "/placeholders/cda/plat4.jpg",
    "/placeholders/cda/plat5.jpg",
  ];

  const testimonials = [
    { name: "Tahiana R.", text: "Un cadre magnifique et une cuisine délicieuse !", rating: 5 },
    { name: "Mamy A.", text: "Le meilleur restaurant d'Antananarivo, je recommande.", rating: 5 },
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

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
              Cuisine, Dégustation, Accueil - Une expérience culinaire unique au cœur d'Antananarivo.
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

      {/* Navigation interne sticky */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 py-3">
            {["menu", "chef-experience", "ambiance", "horaires", "testimonials", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  document.getElementById(tab)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-amber-600 border-b-2 border-amber-600"
                    : "text-gray-500 hover:text-amber-600"
                }`}
              >
                {tab === "menu" && "Menu"}
                {tab === "chef-experience" && "Chef d'un jour"}
                {tab === "ambiance" && "Ambiance"}
                {tab === "horaires" && "Horaires"}
                {tab === "testimonials" && "Avis"}
                {tab === "contact" && "Contact"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suite du contenu */}
      <div className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Menu Section */}
          <section id="menu" className="scroll-mt-24">
            <div className="text-center mb-12">
              <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Notre carte</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Une cuisine généreuse</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Aux saveurs locales et internationales, préparée avec des produits frais
              </p>
            </div>

            <div className="bg-amber-50 rounded-3xl p-8 md:p-12 mb-20">
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
            </div>
          </section>

          {/* Chef Experience - Cuisine participative AVEC IMAGE */}
          <section id="chef-experience" className="scroll-mt-24 mb-20">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-gradient-to-r from-amber-700 to-orange-700 rounded-3xl overflow-hidden shadow-xl"
  >
    <div className="grid md:grid-cols-2 gap-0">
      <div className="p-8 md:p-10 text-white flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm w-fit mb-4">
          <ChefHat className="h-4 w-4" />
          <span>Expérience exclusive</span>
          <Sparkles className="h-3 w-3" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
          Chef d'un jour
          <Gift className="h-6 w-6 text-amber-300" />
        </h2>
        
        <p className="text-amber-100 mb-4 leading-relaxed">
          Une expérience unique vous attend chez ByGagoos CDA ! 
          Chaque <strong className="text-white">vendredi à partir de 14H</strong>, le Chef vous ouvre les portes de sa cuisine.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 mt-0.5">
              <ChefHat className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Préparez votre propre plat</p>
              <p className="text-amber-100 text-sm">Sous la supervision bienveillante du Chef, apprenez à préparer votre commande.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 mt-0.5">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Dégustation collective</p>
              <p className="text-amber-100 text-sm">Partagez votre création avec les autres participants autour d'une table d'hôte.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 mt-0.5">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Certificat du Chef</p>
              <p className="text-amber-100 text-sm">Repartez avec un souvenir personnalisé de votre expérience culinaire.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-amber-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105"
          >
            Réserver mon expérience
            <Calendar className="h-4 w-4" />
          </Link>
          <div className="inline-flex items-center gap-2 text-amber-100 text-sm border border-amber-300/50 rounded-full px-4 py-2">
            <Clock className="h-4 w-4" />
            <span>Tous les vendredis à 14H</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 text-xs text-amber-200">
          <p>⚠️ Places limitées à 8 personnes par session. Réservation obligatoire au moins 48h à l'avance.</p>
        </div>
      </div>

      {/* Image avec plat0.png */}
      <div className="relative h-64 md:h-auto overflow-hidden bg-gradient-to-br from-amber-800 to-orange-800">
        <img
          src="/placeholders/cda/plat0.png"
          alt="Plat signature ByGagoos CDA - Expérience culinaire unique"
          className="w-full h-full object-cover"
          onError={(e) => { 
            (e.target as HTMLImageElement).src = "/images/logo.png";
            (e.target as HTMLImageElement).style.objectFit = "contain";
            (e.target as HTMLImageElement).style.backgroundColor = "#78350f";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-l md:from-black/60 md:to-transparent" />
      </div>
    </div>
  </motion.div>
</section>

          {/* Ambiance Section */}
          <section id="ambiance" className="scroll-mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Notre cadre</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Une ambiance chaleureuse pour des moments inoubliables
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-20">
              {cdaImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-xl cursor-pointer group aspect-square"
                >
                  <img
                    src={image}
                    alt={`Plat ByGagoos CDA ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/logo.png"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Horaires Section */}
          <section id="horaires" className="scroll-mt-24">
            <div className="grid md:grid-cols-2 gap-12 mb-20">
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
                    <span>+261 34 43 359 30</span>
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
            </div>
          </section>

          {/* Témoignages Section */}
          <section id="testimonials" className="scroll-mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ce que nos clients disent de nous
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-20">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section id="contact" className="scroll-mt-24">
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
                <Calendar className="h-4 w-4" />
                Nous contacter
              </Link>
            </motion.div>
          </section>

          {/* Verset */}
          <div className="text-center py-12 border-t mt-12">
            <div className="inline-block bg-amber-50 px-6 md:px-8 py-4 rounded-full border border-amber-200">
              <p className="text-amber-800 italic flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
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