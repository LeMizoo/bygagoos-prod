import { motion } from "framer-motion";
import { Bike, MapPin, Clock, Shield, Smartphone, Heart, Church, Headphones, Award, Phone, Star, Calendar, Mountain, Users, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

export default function TransPage() {
  const features = [
    { icon: Clock, title: "Course rapide", description: "Temps d'attente réduit, arrivée rapide à destination" },
    { icon: Shield, title: "Sécurité garantie", description: "Chauffeurs expérimentés, casques fournis, assurance incluse" },
    { icon: MapPin, title: "Suivi GPS", description: "Localisation en temps réel de votre course" },
    { icon: Smartphone, title: "Réservation facile", description: "Application, téléphone ou directement auprès des chauffeurs" }
  ];

  const excursions = [
    {
      saison: "Printemps",
      mois: "Mars",
      lieu: "Lac Vert",
      distance: "45 km",
      description: "Randonnée autour du lac, observation des oiseaux"
    },
    {
      saison: "Été",
      mois: "Juin",
      lieu: "Chutes de la Lily",
      distance: "50 km",
      description: "Baignade dans les cascades, pique-nique au bord de l'eau"
    },
    {
      saison: "Automne",
      mois: "Septembre",
      lieu: "Lac Tritriva",
      distance: "35 km",
      description: "Découverte du lac sacré, goûter traditionnel"
    },
    {
      saison: "Hiver",
      mois: "Décembre",
      lieu: "Lemurs Park",
      distance: "25 km",
      description: "Safari des lémuriens, déjeuner dans le parc"
    }
  ];

  const transGalleryImages = [
    "/trans/gallery1.jpg",
    "/trans/gallery2.jpg",
    "/trans/gallery3.jpg",
    "/trans/gallery4.jpg",
    "/trans/gallery5.jpg",
    "/trans/gallery6.jpg",
  ];

  const tarifs = [
    { distance: "0-5 km", prix: "2 000 - 4 000 Ar", temps: "5-10 min" },
    { distance: "5-10 km", prix: "4 000 - 8 000 Ar", temps: "10-20 min" },
    { distance: "10-15 km", prix: "8 000 - 12 000 Ar", temps: "20-30 min" },
    { distance: "15+ km", prix: "Sur devis", temps: "Sur mesure" }
  ];

  const testimonials = [
    { name: "Hery R.", text: "Service rapide et fiable, les chauffeurs sont très professionnels.", rating: 5 },
    { name: "Miora T.", text: "Je recommande ByGagoos Trans pour leurs tarifs transparents.", rating: 5 },
    { name: "Lanto S.", text: "Application facile à utiliser, course arrivée en 5 minutes !", rating: 5 },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Bike className="h-4 w-4" />
              <span className="text-sm">Mobilité à Antananarivo</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ByGagoos <span className="text-cyan-300">Trans</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Votre service de Taxi-Moto fiable, rapide et économique pour vos déplacements quotidiens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-cyan-900 px-6 py-3 rounded-full font-semibold hover:bg-cyan-50 transition-all hover:scale-105"
              >
                Réserver une course
                <Bike className="h-4 w-4" />
              </Link>
              <a
                href="tel:+261344359330"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                <Headphones className="h-4 w-4" />
                Appeler maintenant
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation interne sticky */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 py-3">
            {["services", "excursions", "gallery", "tarifs", "testimonials", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => document.getElementById(tab)?.scrollIntoView({ behavior: "smooth" })}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-cyan-600 transition-colors"
              >
                {tab === "services" && "Services"}
                {tab === "excursions" && "Excursions"}
                {tab === "gallery" && "Galerie"}
                {tab === "tarifs" && "Tarifs"}
                {tab === "testimonials" && "Avis"}
                {tab === "contact" && "Contact"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Services Section */}
          <section id="services" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-cyan-600 text-sm font-semibold uppercase tracking-wider">Nos atouts</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Pourquoi choisir ByGagoos Trans ?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Un service pensé pour votre confort, votre sécurité et votre rapidité
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* Excursions Section */}
          <section id="excursions" className="scroll-mt-24 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl overflow-hidden shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 md:p-10 text-white flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm w-fit mb-4">
                    <Mountain className="h-4 w-4" />
                    <span>Événement spécial</span>
                    <Calendar className="h-3 w-3" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                    Excursions ByGagoos
                    <Users className="h-6 w-6 text-emerald-300" />
                  </h2>
                  
                  <p className="text-emerald-100 mb-4 leading-relaxed">
                    4 fois par an, ByGagoos Trans organise des excursions d'une journée aux alentours d'Antananarivo.
                    Départ le matin, retour en fin de journée. Une façon unique de découvrir les merveilles de la région !
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-emerald-300" />
                      <span className="font-semibold">4 excursions par an</span>
                      <span className="text-emerald-200 text-sm">(Printemps, Été, Automne, Hiver)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-300" />
                      <span>Départ le matin - Retour en fin de journée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-emerald-300" />
                      <span>Dans un rayon de 50 km autour d'Antananarivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-emerald-300" />
                      <span>Pique-nique et spécialités préparés par ByGagoos CDA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-300" />
                      <span>Groupes de 10 à 30 personnes</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 bg-white text-emerald-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105"
                    >
                      S'inscrire à la prochaine excursion
                      <Calendar className="h-4 w-4" />
                    </Link>
                    <div className="inline-flex items-center gap-2 text-emerald-100 text-sm border border-emerald-300/50 rounded-full px-4 py-2">
                      <Clock className="h-4 w-4" />
                      <span>Prochaine excursion : Printemps 2026</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-0.5">
                  {excursions.map((excursion, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm p-4 text-center border border-white/10">
                      <p className="text-emerald-300 font-bold text-lg">{excursion.saison}</p>
                      <p className="text-white font-semibold text-sm">{excursion.mois}</p>
                      <p className="text-emerald-200 text-xs mt-1">{excursion.lieu}</p>
                      <p className="text-white text-xs mt-1">{excursion.distance}</p>
                      <p className="text-emerald-200 text-xs mt-0.5">{excursion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Galerie Section */}
          <section id="gallery" className="scroll-mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Notre flotte</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez nos véhicules et nos chauffeurs en action
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
              {transGalleryImages.map((image, index) => (
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
                    alt={`Flotte ByGagoos Trans ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = "/images/logo.png"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tarifs Section */}
          <section id="tarifs" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-cyan-50 rounded-3xl p-8 md:p-12 mb-20"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarifs transparents</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Prix par course, calculés selon la distance. Pas de mauvaise surprise.
                </p>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                {tarifs.map((tarif, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all">
                    <p className="text-lg font-bold text-cyan-700 mb-2">{tarif.distance}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{tarif.prix}</p>
                    <p className="text-xs text-gray-500">Trajet estimé: {tarif.temps}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                *Tarifs susceptibles d'être modifiés selon les conditions de circulation et les heures d'affluence
              </p>
            </motion.div>
          </section>

          {/* Témoignages Section */}
          <section id="testimonials" className="scroll-mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ce que nos clients disent de nous
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-20">
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
              className="bg-gradient-to-r from-cyan-700 to-cyan-600 rounded-3xl p-8 md:p-12 text-center text-white"
            >
              <Award className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à rouler avec nous ?</h2>
              <p className="mb-6 opacity-90 max-w-2xl mx-auto">
                Réservez votre course dès maintenant et bénéficiez d'un service rapide et fiable
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white text-cyan-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105"
                >
                  Réserver en ligne
                </Link>
                <a
                  href="tel:+261344359330"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </a>
              </div>
            </motion.div>
          </section>

          {/* Verset */}
          <div className="text-center py-12 border-t mt-12">
            <div className="inline-block bg-amber-50 px-6 md:px-8 py-4 rounded-full border border-amber-200">
              <p className="text-amber-800 italic flex items-center gap-2 md:gap-3 text-sm md:text-base">
                <Church className="h-5 w-5 text-amber-600" />
                "Va, et ne tarde pas à faire le bien autour de toi"
                <Heart className="h-5 w-5 text-amber-600" />
              </p>
              <p className="text-amber-600 text-xs md:text-sm mt-1">— Proverbes 3:27</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}