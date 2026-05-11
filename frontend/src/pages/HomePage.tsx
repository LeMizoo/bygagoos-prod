import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ActivityModuleCard from "../components/home/ActivityModuleCard";
import { activityModules } from "../data/activities";
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Palette,
  Heart,
  Users,
  Award,
  CheckCircle,
  Cross,
  Church,
  Sun
} from "lucide-react";

// Slides avec données enrichies
const slides = [
  {
    id: 1,
    image: "/production/atelier-serigraphie.jpg",
    verse: "Colossiens 3:23",
    quote: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur.",
    theme: "Excellence artisanale",
    author: "Apôtre Paul",
    color: "from-amber-600 to-amber-800"
  },
  {
    id: 2,
    image: "/production/equipe-serigraphie.jpg",
    verse: "Proverbes 16:3",
    quote: "Remets à l'Éternel ce que tu fais, et tes projets réussiront.",
    theme: "Confiance et réussite",
    author: "Roi Salomon",
    color: "from-blue-600 to-blue-800"
  },
  {
    id: 3,
    image: "/production/marcel-prod.jpg",
    verse: "Proverbes 14:23",
    quote: "Tout travail procure l'abondance, les paroles vides mènent à la pauvreté.",
    theme: "Valeur du travail",
    author: "Roi Salomon",
    color: "from-emerald-600 to-emerald-800"
  },
  {
    id: 4,
    image: "/production/marcelin-prod.jpg",
    verse: "Ecclésiaste 3:13",
    quote: "Jouir du fruit de son travail, c'est un don de Dieu.",
    theme: "Joie et gratitude",
    author: "Roi Salomon",
    color: "from-purple-600 to-purple-800"
  },
  {
    id: 5,
    image: "/production/equipe-prod-02.jpg",
    verse: "Psaumes 90:17",
    quote: "Affermis l'ouvrage de nos mains, Seigneur !",
    theme: "Bénédiction divine",
    author: "Moïse",
    color: "from-amber-600 to-amber-800"
  },
];

const features = [
  {
    icon: Palette,
    title: "Design sur mesure",
    description: "Créez des designs uniques avec notre équipe d'artistes passionnés",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    stats: "500+ créations",
    verse: "« Créer, c'est imiter Dieu »"
  },
  {
    icon: Shield,
    title: "Qualité irréprochable",
    description: "Matériaux premium et finitions parfaites pour une durabilité maximale",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    stats: "98% satisfaction",
    verse: "« Ce qui est parfait vient de Dieu »"
  },
  {
    icon: Zap,
    title: "Livraison express",
    description: "De votre atelier à votre porte, fabrication et livraison rapides",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    stats: "24-48h",
    verse: "« En temps et en heure »"
  },
  {
    icon: Heart,
    title: "Approche familiale",
    description: "Une entreprise familiale qui traite chaque client comme un proche",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    stats: "4 générations",
    verse: "« Heureux les artisans de paix »"
  },
];

const stats = [
  { value: "500+", label: "Clients satisfaits", icon: Users },
  { value: "2000+", label: "Designs réalisés", icon: Palette },
  { value: "98%", label: "Clients fidèles", icon: Star },
  { value: "24/7", label: "Support client", icon: Clock },
];

const testimonials = [
  {
    name: "Marie R.",
    role: "Créatrice de mode",
    content: "Un travail exceptionnel ! Ils ont su capturer exactement ce que je voulais.",
    rating: 5,
    verse: "« La beauté sauvera le monde »",
    image: "/testimonials/avatar1.jpg"
  },
  {
    name: "Jean-Paul T.",
    role: "Responsable communication",
    content: "Qualité premium et équipe à l'écoute. Je recommande vivement !",
    rating: 5,
    verse: "« Une bonne renommée vaut mieux qu'un grand parfum »",
    image: "/testimonials/avatar2.jpg"
  },
  {
    name: "Sarah L.",
    role: "Artiste indépendante",
    content: "Le respect des délais et la qualité sont irréprochables.",
    rating: 5,
    verse: "« Tout vient à point à qui sait attendre »",
    image: "/testimonials/avatar3.jpg"
  },
];

// Composant pour le slider
const HeroSlider = ({ slides, currentSlide, setCurrentSlide, nextSlide, prevSlide }: any) => {
  return (
    <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
      {/* Images du slider avec animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Overlay dégradé avec la couleur du thème */}
          <div className={`absolute inset-0 bg-gradient-to-t from-${slides[currentSlide].color.split(' ')[0].replace('from-', '')}/90 via-black/40 to-black/30 z-10`} />
          
          {/* Image */}
          <img
            src={slides[currentSlide].image}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/fallback-image.jpg";
            }}
          />

          {/* Contenu textuel */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium tracking-wider mb-6 border border-white/30"
              >
                {slides[currentSlide].theme}
              </motion.span>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-6 leading-tight"
              >
                "<span className="font-semibold">{slides[currentSlide].quote}</span>"
              </motion.h2>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="space-y-2"
              >
                <p className="text-xl text-white/90 font-light">
                  — {slides[currentSlide].verse}
                </p>
                <p className="text-sm text-white/70">
                  {slides[currentSlide].author}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Boutons de navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/20 group"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/20 group"
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "w-12 bg-amber-600" 
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features-section');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider */}
      <HeroSlider
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        nextSlide={nextSlide}
        prevSlide={prevSlide}
      />

      {/* Logo Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-gradient-to-b from-white to-amber-50/30 border-b border-amber-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              src="/images/bygagoos-large.png"
              alt="ByGagoos Ink"
              className="h-24 md:h-32 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
            
            {/* Verset sous le logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center gap-2 text-amber-600 text-sm"
            >
              <Cross className="h-3 w-3" />
              <span className="italic">"Gloire à Dieu dans les lieux très hauts"</span>
              <Cross className="h-3 w-3" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Hero Content */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full text-sm font-semibold mb-6 shadow-lg"
            >
              ✨ Artisan d'exception depuis 2025
            </motion.span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight">
              Donnez vie à vos{' '}
              <span className="font-semibold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                idées
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              L'art de la sérigraphie au service de votre créativité. 
              Des designs uniques, une qualité exceptionnelle, une approche familiale.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/gallery"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all hover:shadow-xl hover:scale-105"
              >
                Explorer la galerie
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 border-2 border-amber-300 rounded-lg hover:border-amber-600 hover:text-amber-600 transition-all hover:shadow-lg"
              >
                Discuter de mon projet
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="text-center group cursor-default"
                >
                  <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Activités */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
              Un seul socle, plusieurs activités
            </div>
            <h2 className="mt-6 text-3xl md:text-4xl font-light text-gray-900">
              Choisissez votre espace de travail
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              On garde la base technique commune, mais chaque activité vit dans son propre
              module métier, ses écrans et ses routes.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activityModules.map((module) => (
              <ActivityModuleCard key={module.key} module={module} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 text-sm font-medium">Pourquoi nous choisir</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              <span className="font-semibold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                ByGagoos Ink
              </span>{' '}
              une signature, une promesse
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience complète de la conception à la livraison
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Cadre doré au survol */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                
                <div className="relative">
                  {/* Badge statistique */}
                  <div className="absolute top-0 right-0">
                    <span className="px-3 py-1 bg-amber-100 rounded-full text-xs font-semibold text-amber-600 border border-amber-200">
                      {feature.stats}
                    </span>
                  </div>

                  {/* Icône avec dégradé */}
                  <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Citation spirituelle */}
                  <p className="text-xs italic text-amber-600 border-t border-amber-100 pt-3">
                    {feature.verse}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 text-amber-600 fill-current" />
              <span className="text-amber-800 text-sm font-medium">Ils nous font confiance</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Ce qu'ils disent de <span className="font-semibold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">nous</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La satisfaction de nos clients est notre plus belle récompense
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                {/* Cadre doré au survol */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                
                <div className="relative">
                  {/* Étoiles */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>

                  {/* Contenu */}
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Citation spirituelle */}
                  <p className="text-xs text-amber-600 mb-4 border-l-2 border-amber-300 pl-3">
                    {testimonial.verse}
                  </p>

                  {/* Auteur */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Fond avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-800 to-amber-600"></div>
        
        {/* Motifs décoratifs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Motifs géométriques */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Croix décorative */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Cross className="h-64 w-64 text-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 inline-block"
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <Sun className="h-4 w-4" />
                <span className="text-white text-sm">Nouveau chapitre</span>
                <Sun className="h-4 w-4" />
              </div>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
              Prêt à créer quelque chose d'<span className="font-semibold">extraordinaire</span> ?
            </h2>
            
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Rejoignez des centaines de créatifs qui ont choisi ByGagoos Ink 
              pour donner vie à leurs projets
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-amber-700 bg-white rounded-xl hover:bg-gray-100 transition-all hover:shadow-2xl group"
              >
                Commencer l'aventure
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={24} />
              </Link>
            </motion.div>

            {/* Garanties */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/80 text-sm">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Sans engagement
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Devis gratuit
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Support 24/7
              </span>
            </div>

            {/* Signature spirituelle */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mt-8 flex items-center justify-center gap-2 text-amber-200 text-sm"
            >
              <Cross className="h-4 w-4" />
              <span className="italic">"Que l'Éternel bénisse notre rencontre"</span>
              <Cross className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
