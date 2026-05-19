import { motion } from "framer-motion";
import { Palette, Shirt, Package, Sparkles, Heart, Cross, Church, Users, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function InkPage() {
  const services = [
    {
      icon: Shirt,
      title: "Sérigraphie textile",
      description: "Impression sur mesure sur t-shirts, sweats, tote bags, casquettes et textiles personnalisés.",
      features: ["10+ pièces minimum", "Jusqu'à 6 couleurs", "Encres écologiques certifiées"],
      image: "/images/gallery/placeholder-tshirt.jpg"
    },
    {
      icon: Palette,
      title: "Design personnalisé",
      description: "Création sur mesure de vos visuels avec notre équipe de designers passionnés.",
      features: ["Vectorisation incluse", "BAT gratuit", "Corrections illimitées"],
      image: "/production/equipe-prod-02.jpg"
    },
    {
      icon: Package,
      title: "Packaging",
      description: "Solutions d'emballage personnalisées pour valoriser vos produits.",
      features: ["Carton, papier, textile", "Finition premium", "Petites et grandes séries"],
      image: "/production/atelier-serigraphie.jpg"
    }
  ];

  const processSteps = [
    { step: "1", title: "Devis gratuit", desc: "Contactez-nous pour un devis personnalisé", icon: Users },
    { step: "2", title: "Validation BAT", desc: "Approbation du Bon À Tirer", icon: Sparkles },
    { step: "3", title: "Production", desc: "Fabrication artisanale en 5-10 jours", icon: Clock },
    { step: "4", title: "Livraison", desc: "À Tana ou expédition province", icon: Shield }
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
      <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Artisanat malgache depuis 2025</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ByGagoos <span className="text-purple-300">Ink</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              L'art de la sérigraphie textile à Antananarivo. Transformez vos idées en œuvres imprimées avec soin et passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-900 px-6 py-3 rounded-full font-semibold hover:bg-purple-100 transition-all hover:scale-105"
              >
                Demander un devis gratuit
                <Sparkles className="h-4 w-4" />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                Voir nos réalisations
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-purple-600 text-sm font-semibold uppercase tracking-wider">Notre savoir-faire</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Des services d'exception</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des solutions d'impression adaptées à tous vos besoins, pour les particuliers et les professionnels
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = "/images/logo.png"; }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Processus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-purple-50 rounded-3xl p-8 md:p-12 mb-20"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre processus de création</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                De l'idée à la réalisation, nous vous accompagnons à chaque étape avec transparence et professionnalisme
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {processSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                      {index < 3 ? <StepIcon className="h-6 w-6" /> : step.step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-700 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à concrétiser votre projet ?</h2>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Discutons de votre idée et obtenez un devis personnalisé sous 24h
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              Demander un devis
              <Sparkles className="h-4 w-4" />
            </Link>
          </motion.div>

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