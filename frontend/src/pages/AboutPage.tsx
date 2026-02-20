import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Heart,
  Target,
  Award,
  Shield,
  Sparkles,
  Globe,
  Check,
  Calendar,
  Church,
  Cross,
  Sun,
} from "lucide-react";

export default function AboutPage() {
  // Animation variants - CORRIGÉ
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 relative overflow-hidden"
      >
        {/* Éléments décoratifs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <div className="absolute top-10 left-10 text-8xl">✝️</div>
          <div className="absolute bottom-10 right-10 text-8xl">🙏</div>
        </motion.div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Inauguré le 18 mai 2025</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Notre Histoire Familiale
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Plus qu'un atelier, une passion familiale dédiée à l'art de la
              sérigraphie
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto"
          >
            {/* ✅ Proverbes 16:3 - Intégré en haut pour bénir la lecture */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center"
            >
              <div className="inline-block bg-blue-50 px-6 py-4 rounded-full shadow-sm border border-blue-200">
                <p className="text-blue-800 font-serif italic flex items-center gap-3">
                  <Cross className="h-4 w-4 text-blue-600" />
                  "Remets à l'Éternel tes œuvres, et tes projets réussiront."
                  <Cross className="h-4 w-4 text-blue-600" />
                </p>
                <p className="text-blue-600 text-sm mt-1">— Proverbes 16:3</p>
              </div>
            </motion.div>

            {/* Image principale */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <img
                src="/team-family.jpg"
                alt="Équipe familiale ByGagoos-Ink"
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-xl"
              />
              <p className="text-center text-gray-500 text-sm mt-2">
                L'équipe fondatrice de ByGagoos-Ink le jour de l'inauguration
              </p>
            </motion.div>

            {/* Verset biblique principal */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <div className="inline-block bg-amber-50 p-8 rounded-2xl border-l-4 border-amber-500 shadow-lg max-w-3xl">
                <Cross className="h-8 w-8 text-amber-600 mx-auto mb-4" />
                <p className="text-2xl text-amber-900 font-serif italic mb-4">
                  "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes."
                </p>
                <p className="text-amber-700 font-semibold">— Colossiens 3:23</p>
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-amber-800">
                    Ce verset est le fondement de notre travail. Chaque création est réalisée avec amour et dévotion, 
                    comme une offrande de gratitude.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Histoire */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Heart className="h-8 w-8 text-red-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  La naissance de ByGagoos-Ink
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">Le 18 mai 2025</strong> restera gravé dans nos mémoires. 
                  C'est ce jour-là que ByGagoos-Ink a ouvert officiellement ses portes, transformant un rêve 
                  familial en réalité. Dans notre atelier d'Antananarivo, entourés de nos proches et de nos 
                  premiers clients, nous avons célébré le début d'une nouvelle aventure.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">ByGagoos-Ink</strong> est né d'une évidence : notre famille 
                  partageait la même passion pour l'artisanat textile et le désir de créer ensemble. 
                  Ce qui n'était au début qu'une idée discutée autour de la table familiale est devenu, 
                  après des mois de préparation, un atelier de sérigraphie artisanal.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Le nom <strong className="text-blue-600">"Gagoos"</strong> vient du surnom affectueux donné 
                  à Tovoniaina, notre fondateur, par ses petits-enfants. Ce nom représente parfaitement 
                  l'ambiance que nous voulions créer : chaleureuse, familiale et authentique.
                </p>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-4"
                >
                  <p className="text-blue-800 font-medium italic flex items-center gap-2">
                    <Church className="h-5 w-5 text-blue-600" />
                    "Avant chaque grande décision, nous prions ensemble en famille. C'est dans la foi que nous avons trouvé le courage de nous lancer."
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Notre Histoire en Dates
              </h2>
              <div className="relative">
                {/* Ligne de temps */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 hidden md:block"></div>
                
                <div className="space-y-8">
                  {/* 2024 - Début du projet */}
                  <motion.div 
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col md:flex-row items-center md:items-start gap-8"
                  >
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">Début 2024</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">La genèse du projet</h3>
                        <p className="text-gray-600">Premières discussions familiales autour de l'idée de créer un atelier de sérigraphie. Les soirées se prolongent autour de croquis, d'échantillons et de prières communes.</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow z-10 hidden md:block"></div>
                    <div className="md:w-1/2 md:pl-8"></div>
                  </motion.div>

                  {/* Fin 2024 - Préparatifs */}
                  <motion.div 
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col md:flex-row items-center md:items-start gap-8"
                  >
                    <div className="md:w-1/2 md:text-right md:pr-8"></div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow z-10 hidden md:block"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <span className="inline-block bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">Fin 2024</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">L'atelier prend forme</h3>
                        <p className="text-gray-600">Recherche du local idéal, acquisition des premières machines. Nous avons béni chaque nouvel équipement avant son installation.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 18 Mai 2025 - Inauguration */}
                  <motion.div 
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col md:flex-row items-center md:items-start gap-8"
                  >
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                        <span className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">18 MAI 2025</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Inauguration officielle</h3>
                        <p className="text-gray-600">Ouverture des portes de ByGagoos-Ink. Un prêtre est venu bénir les lieux avant la célébration. Famille, amis et premiers clients se rassemblent pour ce moment historique.</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow z-10 hidden md:block"></div>
                    <div className="md:w-1/2 md:pl-8"></div>
                  </motion.div>

                  {/* Aujourd'hui */}
                  <motion.div 
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col md:flex-row items-center md:items-start gap-8"
                  >
                    <div className="md:w-1/2 md:text-right md:pr-8"></div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow z-10 hidden md:block"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <span className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">Aujourd'hui</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Les premiers pas</h3>
                        <p className="text-gray-600">Depuis l'inauguration, nous réalisons nos premières commandes et construisons jour après jour notre réputation, toujours guidés par notre foi.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Nos Valeurs */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Nos Valeurs Fondamentales
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Les principes chrétiens qui guident chaque décision et chaque création depuis notre inauguration
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Target,
                    color: "text-blue-600",
                    title: "Excellence artisanale",
                    verse: "Tout ce que ta main trouve à faire, fais-le avec ta force. (Ecclésiaste 9:10)"
                  },
                  {
                    icon: Users,
                    color: "text-amber-600",
                    title: "Éthique familiale",
                    verse: "Comme des frères, aimez-vous les uns les autres. (Romains 12:10)"
                  },
                  {
                    icon: Sparkles,
                    color: "text-purple-600",
                    title: "Innovation durable",
                    verse: "Il y a du progrès pour tout homme habile dans son travail. (Psaumes 1:3)"
                  },
                  {
                    icon: Shield,
                    color: "text-emerald-600",
                    title: "Service personnalisé",
                    verse: "Que votre lumière luise ainsi devant les hommes. (Matthieu 5:16)"
                  }
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className="bg-white p-6 rounded-xl shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <value.icon className={`h-6 w-6 ${value.color}`} />
                      <h3 className="font-bold text-gray-900">
                        {value.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      {value.verse}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* L'Équipe Fondatrice - Version Prestige */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              {/* En-tête luxueux */}
              <div className="text-center mb-12">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-4"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                    <Users className="h-6 w-6 text-amber-600" />
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                  </div>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 mb-4">
                  L'<span className="font-semibold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">Artisanat</span> Sacré
                </h2>
                
                <div className="max-w-2xl mx-auto">
                  <p className="text-gray-500 text-lg italic mb-2">
                    "Comme des pierres vivantes, nous bâtissons une maison spirituelle"
                  </p>
                  <p className="text-amber-600 text-sm font-medium tracking-wider uppercase">
                    — 1 Pierre 2:5
                  </p>
                </div>
                
                {/* Séparateur décoratif */}
                <div className="flex justify-center gap-2 mt-6">
                  <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                </div>
              </div>

              {/* Grille des membres - Layout Magazine */}
              <div className="grid lg:grid-cols-2 gap-8">
                {[
                  {
                    name: "Tovoniaina Rahendrison",
                    role: "Fondateur & Visionnaire",
                    border: "border-amber-400/30",
                    bg: "from-amber-50/50 to-amber-100/30",
                    text: "text-amber-900",
                    accent: "amber",
                    image: "/profiles/tovoniaina.jpg",
                    expertise: ["Stratégie", "Vision", "Éthique"],
                    bibleVerse: "« Bâtis sur le fondement des apôtres et des prophètes »",
                    verseRef: "Éphésiens 2:20",
                    description: "Visionnaire et guide spirituel de l'atelier. Son leadership s'inspire des pères fondateurs, alliant sagesse ancestrale et innovation.",
                    quote: "L'excellence est notre offrande, la foi notre fondation."
                  },
                  {
                    name: "Volatiana Randrianarisoa",
                    role: "Directrice Artistique",
                    border: "border-amber-400/30",
                    bg: "from-amber-50/50 to-amber-100/30",
                    text: "text-amber-900",
                    accent: "amber",
                    image: "/profiles/volatiana.jpg",
                    expertise: ["Création", "Harmonie", "Beauté"],
                    bibleVerse: "« Elle se revêt de force et de dignité »",
                    verseRef: "Proverbes 31:25",
                    description: "Sa sensibilité artistique transforme chaque création en œuvre d'art. Elle puise son inspiration dans la beauté de la création divine.",
                    quote: "La beauté est le langage silencieux de l'âme."
                  },
                  {
                    name: "Miantsatiana Rahendrison",
                    role: "Maître d'Atelier",
                    border: "border-amber-400/30",
                    bg: "from-amber-50/50 to-amber-100/30",
                    text: "text-amber-900",
                    accent: "amber",
                    image: "/profiles/miantsatiana.jpg",
                    expertise: ["Précision", "Métier", "Transmission"],
                    bibleVerse: "« Tout ce que ta main trouve à faire, fais-le avec ta force »",
                    verseRef: "Ecclésiaste 9:10",
                    description: "Héritier des techniques ancestrales, il veille à l'excellence de chaque production avec la rigueur d'un maître artisan.",
                    quote: "La main qui travaille prie deux fois."
                  },
                  {
                    name: "Tia Faniry Rahendrison",
                    role: "Relations & Harmonie",
                    border: "border-amber-400/30",
                    bg: "from-amber-50/50 to-amber-100/30",
                    text: "text-amber-900",
                    accent: "amber",
                    image: "/profiles/tia-faniry.jpg",
                    expertise: ["Accueil", "Service", "Bienveillance"],
                    bibleVerse: "« Que votre lumière luise devant les hommes »",
                    verseRef: "Matthieu 5:16",
                    description: "Son approche chaleureuse transforme chaque relation client en rencontre authentique, reflétant l'hospitalité malgache.",
                    quote: "Chaque rencontre est une bénédiction."
                  }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    whileHover={{ y: -8 }}
                    className="group relative"
                  >
                    {/* Cadre doré au survol */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                    
                    {/* Carte principale */}
                    <div className={`relative bg-gradient-to-br ${member.bg} backdrop-blur-sm rounded-2xl overflow-hidden border border-amber-200/50 shadow-xl`}>
                      
                      {/* Motif décoratif de fond */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-300 rounded-full blur-3xl"></div>
                      </div>

                      <div className="relative flex flex-col md:flex-row">
                        {/* Section Photo - Version luxe */}
                        <div className="md:w-2/5 relative overflow-hidden">
                          <div className="aspect-[4/5] md:aspect-auto md:h-full">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          
                          {/* Overlay dégradé */}
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent"></div>
                          
                          {/* Badge expertise */}
                          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                            {member.expertise.map((exp, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-white/90 backdrop-blur-sm text-amber-900 text-xs font-medium rounded-full shadow-lg"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Section Contenu */}
                        <div className="md:w-3/5 p-6 md:p-8">
                          {/* Citation biblique */}
                          <div className="mb-4">
                            <div className="inline-block bg-amber-100/80 backdrop-blur-sm px-4 py-2 rounded-full">
                              <p className="text-xs text-amber-800 italic">
                                {member.bibleVerse}
                              </p>
                              <p className="text-[10px] text-amber-600 mt-0.5">
                                {member.verseRef}
                              </p>
                            </div>
                          </div>

                          {/* Nom et rôle */}
                          <h3 className="text-2xl font-light text-gray-800 mb-1">
                            {member.name.split(' ')[0]} <span className="font-semibold">{member.name.split(' ')[1]}</span>
                          </h3>
                          <p className={`text-sm font-medium tracking-wider uppercase ${member.text} mb-4`}>
                            {member.role}
                          </p>

                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {member.description}
                          </p>

                          {/* Citation personnelle */}
                          <div className="relative">
                            <div className="absolute -top-2 -left-2 text-4xl text-amber-300/50 font-serif">"</div>
                            <p className="relative text-base italic text-gray-700 pl-4 border-l-2 border-amber-400">
                              {member.quote}
                            </p>
                          </div>

                          {/* Signature spirituelle */}
                          <div className="mt-4 flex items-center gap-2">
                            <div className="w-8 h-px bg-amber-300"></div>
                            <Cross className="h-3 w-3 text-amber-400" />
                            <div className="w-8 h-px bg-amber-300"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message d'unité sacrée - Version luxe */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center relative"
              >
                {/* Fond décoratif */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/50 to-amber-100/0 rounded-3xl"></div>
                
                <div className="relative bg-white/60 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 max-w-3xl mx-auto shadow-xl">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                    <Heart className="h-5 w-5 text-amber-500" />
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                  </div>
                  
                  <p className="text-amber-800 text-lg font-light italic mb-3">
                    "Là où deux ou trois sont rassemblés en mon nom, je suis au milieu d'eux."
                  </p>
                  <p className="text-amber-600 text-sm mb-6">— Matthieu 18:20</p>
                  
                  <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Cross className="h-3 w-3 text-amber-500" />
                      <span>Une famille</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <Cross className="h-3 w-3 text-amber-500" />
                      <span>Une foi</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <Cross className="h-3 w-3 text-amber-500" />
                      <span>Une mission</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Mission et Action de Grâce */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              {/* Mission */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <Globe className="h-12 w-12 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800 text-xl mb-3">
                      Notre Mission
                    </h4>
                    <blockquote className="text-blue-700 text-lg italic border-l-4 border-blue-400 pl-4 py-2">
                      "Créer des pièces uniques qui racontent une histoire, tout
                      en préservant les techniques artisanales malgaches et en
                      valorisant le travail familial. Depuis notre inauguration le 
                      18 mai 2025, notre engagement reste le même : transformer 
                      votre vision en réalité tangible, avec la chaleur et 
                      l'authenticité qui font notre signature."
                    </blockquote>
                    <p className="text-blue-600 font-semibold mt-4">
                      — La Famille Rahendrison
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action de Grâce */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-amber-50 p-8 rounded-2xl border border-amber-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <Sun className="h-12 w-12 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-xl mb-3">
                      Notre Action de Grâce
                    </h4>
                    <div className="space-y-4">
                      <p className="text-amber-700">
                        <strong>Dieu Tout-Puissant,</strong> nous te rendons grâce pour ce chemin parcouru.
                      </p>
                      <p className="text-amber-700 italic">
                        Merci pour l'unité de notre famille, pour la santé de nos mains qui créent, 
                        pour la patience dans les épreuves et la joie dans les réussites.
                      </p>
                      <p className="text-amber-700">
                        Que chaque vêtement qui sort de notre atelier soit imprégné de l'amour que nous 
                        mettons à le créer. Que nos clients ressentent, à travers notre travail, 
                        un reflet de Ta bonté.
                      </p>
                      <motion.div 
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="pt-4 text-center"
                      >
                        <p className="text-amber-800 font-serif text-lg">
                          "Non nobis, Domine, non nobis, sed nomini tuo da gloriam."
                        </p>
                        <p className="text-amber-600 text-sm">
                          (Pas à nous, Seigneur, pas à nous, mais à ton nom donne gloire)
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Call to Action */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="mt-12 text-center"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <Church className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Que Dieu bénisse notre rencontre
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Depuis le 18 mai 2025, nous écrivons notre histoire jour après jour, 
                  guidés par la foi et l'amour du travail bien fait. 
                  Nous serions honorés de compter parmi nos clients.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/gallery"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Voir nos réalisations
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/contact"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Discuter de mon projet
                  </motion.a>
                </div>
                <motion.p 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-sm text-gray-400 mt-6"
                >
                  ✝️ Que la paix soit avec vous ✝️
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}