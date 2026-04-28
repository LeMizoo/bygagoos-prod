import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  AlertCircle,
  Heart,
  Instagram,
  Facebook,
  Linkedin,
  Map,
  CheckCircle,
  Cross,
  Church
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nom requis";
    if (!formData.email.trim()) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.subject.trim()) newErrors.subject = "Sujet requis";
    if (!formData.message.trim()) newErrors.message = "Message requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simuler l'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      
      // Cacher le message de succès après 5 secondes
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
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

  const contactInfo = [
    {
      icon: MapPin,
      title: "Notre Atelier",
      details: ["Antananarivo", "Madagascar"],
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-200",
      verse: "« Tes pas se sont posés sur cette terre bénie »",
      verseRef: "— Psaume 85:14"
    },
    {
      icon: Phone,
      title: "Téléphone",
      details: ["+261 34 43 593 30", "Lun-Ven, 8h-17h"],
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-blue-200",
      verse: "« Invoque-moi, et je te répondrai »",
      verseRef: "— Jérémie 33:3"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["positifaid@live.fr", "Réponse sous 24h"],
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
      border: "border-purple-200",
      verse: "« Que ma parole soit accueillie avec grâce »",
      verseRef: "— Psaume 19:15"
    },
    {
      icon: Clock,
      title: "Horaires",
      details: ["Lundi - Vendredi", "8h00 - 17h00", "Week-end sur RDV"],
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-200",
      verse: "« Il y a un temps pour toute chose »",
      verseRef: "— Ecclésiaste 3:1"
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* En-tête décoratif */}
      <div className="relative h-48 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-800 overflow-hidden">
        {/* Motifs décoratifs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Croix décorative */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Cross className="h-32 w-32 text-white" />
        </div>
        
        <div className="relative h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Heart className="h-4 w-4 text-amber-200" />
              <span className="text-amber-100 text-sm">Matthieu 7:7</span>
              <Heart className="h-4 w-4 text-amber-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-wide">
              <span className="font-semibold">Entrons</span> en Contact
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Verset d'ouverture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-block bg-amber-50 px-8 py-4 rounded-full border border-amber-200 shadow-sm">
                <p className="text-amber-800 italic flex items-center gap-3">
                  <Church className="h-5 w-5 text-amber-600" />
                  "Cherchez, et vous trouverez; frappez, et l'on vous ouvrira."
                  <Church className="h-5 w-5 text-amber-600" />
                </p>
                <p className="text-amber-600 text-sm mt-1">— Matthieu 7:7</p>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Informations de contact - Version luxe */}
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="lg:col-span-5 space-y-6"
              >
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ x: 5 }}
                      className={`group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 ${info.border}`}
                    >
                      {/* Fond décoratif */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/50 rounded-2xl"></div>
                      
                      <div className="relative flex items-start gap-4">
                        <div className={`${info.bg} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-6 w-6 ${info.iconColor}`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {info.title}
                          </h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-gray-600 text-sm">
                              {detail}
                            </p>
                          ))}
                          
                          {/* Citation spirituelle */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs italic text-gray-500">
                              {info.verse}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {info.verseRef}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Réseaux sociaux */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg border border-gray-200"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Suivez notre aventure
                  </h3>
                  
                  <div className="flex gap-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={index}
                          whileHover={{ y: -3 }}
                          href={social.href}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 bg-white rounded-xl border border-gray-200 ${social.color} transition-all hover:shadow-md`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium hidden sm:inline">
                            {social.label}
                          </span>
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Carte miniature */}
                <motion.div
                  variants={fadeInUp}
                  className="relative h-48 rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 to-transparent z-10"></div>
                  <img
                    src="/production/atelier-serigraphie.jpg"
                    alt="Notre atelier"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white">
                    <Map className="h-5 w-5" />
                    <span className="font-medium">Antananarivo, Madagascar</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Formulaire de contact - Version luxe */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-7"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                  {/* En-tête du formulaire */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full"></div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-light text-gray-900">
                        <span className="font-semibold">Envoyez-nous</span> un message
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Nous vous répondrons dans les plus brefs délais
                      </p>
                    </div>
                  </div>

                  {/* Message de succès */}
                  <AnimatePresence>
                    {submitSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-green-800 font-medium">
                            Message envoyé avec succès !
                          </p>
                          <p className="text-green-600 text-sm">
                            Nous vous répondrons dans les 24 heures.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-4 border ${
                            errors.name ? "border-red-300" : "border-gray-200"
                          } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white`}
                          placeholder="Jean Rakoto"
                        />
                        {errors.name && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center mt-2 text-sm text-red-600"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.name}
                          </motion.div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-4 border ${
                            errors.email ? "border-red-300" : "border-gray-200"
                          } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white`}
                          placeholder="votre@email.com"
                        />
                        {errors.email && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center mt-2 text-sm text-red-600"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.email}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                        placeholder="+261 34 12 345 67"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet <span className="text-amber-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-4 border ${
                          errors.subject ? "border-red-300" : "border-gray-200"
                        } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white appearance-none`}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="devis">Demande de devis</option>
                        <option value="commande">Commande personnalisée</option>
                        <option value="info">Information sur nos produits</option>
                        <option value="partenariat">Partenariat</option>
                        <option value="autre">Autre</option>
                      </select>
                      {errors.subject && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center mt-2 text-sm text-red-600"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.subject}
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-amber-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className={`w-full px-4 py-4 border ${
                          errors.message ? "border-red-300" : "border-gray-200"
                        } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white resize-none`}
                        placeholder="Décrivez-nous votre projet en quelques mots..."
                      />
                      {errors.message && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center mt-2 text-sm text-red-600"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.message}
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Signature spirituelle */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <Cross className="h-3 w-3" />
                      <span>"Que ma prière parvienne jusqu'à toi" — Psaume 88:3</span>
                      <Cross className="h-3 w-3" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="pt-4"
                    >
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-5 text-lg flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Envoi en cours...
                          </span>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                            Envoyer le message
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}