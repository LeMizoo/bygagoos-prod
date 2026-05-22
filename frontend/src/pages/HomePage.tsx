import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  UtensilsCrossed,
  Palette,
  ArrowUpRight,
  Crown,
  CheckCircle2,
  Heart,
  Church,
  Phone,
  Mail,
  Bike,
  Users,
} from "lucide-react";
import FamilyMembersGrid from "../components/family/FamilyMembersGrid";
import ActivityModuleCard from "../components/home/ActivityModuleCard";
import { activityModules } from "../data/activities";
import { businessUnits, executivePillars, prodBrand } from "../data/prod";

const heroStats = [
  { label: "Activités", value: "3", icon: Sparkles },
  { label: "Direction", value: "4", icon: Crown },
  { label: "Années d'expérience", value: "2", icon: Shield },
];

const activitiesHero = [
  {
    name: "ByGagoos Ink",
    icon: Palette,
    color: "from-purple-500 to-purple-600",
    bgGradient: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
    description: "Designs, commandes, production et galerie publique.",
    image: "/home/ink-card.jpg"
  },
  {
    name: "ByGagoos Trans",
    icon: Bike,
    color: "from-cyan-500 to-cyan-600",
    bgGradient: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10",
    description: "Flotte Taxi-Moto, conducteurs, maintenance et missions.",
    image: "/home/trans-card.jpg"
  },
  {
    name: "ByGagoos CDA (Cuisine, Dégustation, Accueil)",
    icon: UtensilsCrossed,
    color: "from-amber-500 to-amber-600",
    bgGradient: "bg-gradient-to-br from-amber-500/20 to-amber-600/10",
    description: "Bar / restaurant, réservations, salle et exploitation.",
    image: "/home/cda-card.jpg"
  },
];

// Images pour la section des valeurs / ambiance
const homeGalleryImages = [
  "/home/gallery1.jpg",
  "/home/gallery2.jpg",
  "/home/gallery3.jpg",
];

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#activities") {
      const element = document.getElementById("activities");
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Style AgileFleet */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 rounded-full bg-amber-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Column - Text */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Maison familiale multi-activités
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                  ByGagoos
                </span>{" "}
                Prod
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/80 max-w-2xl">
                {prodBrand.tagline}
              </p>
              <p className="mt-4 text-base leading-7 text-white/60 max-w-2xl">
                {prodBrand.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/prod/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl"
                >
                  Voir la Direction Générale
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/home#activities"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Explorer les activités
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-6">
                {heroStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="rounded-full bg-white/10 p-2">
                        <Icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-white/60">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Three Activities Cards avec images */}
            <div className="grid gap-4">
              {activitiesHero.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.name}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className={`group relative overflow-hidden rounded-2xl ${activity.bgGradient} border border-white/10 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-white/20`}
                  >
                    <Link to={activity.name === "ByGagoos Ink" ? "/ink" : activity.name === "ByGagoos Trans" ? "/trans" : "/cda"} className="relative flex items-center gap-4 p-5">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={activity.image}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="h-7 w-7 text-white drop-shadow-lg" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{activity.name === "ByGagoos CDA (Cuisine, Dégustation, Accueil)" ? "ByGagoos CDA" : activity.name}</h3>
                        <p className="text-sm text-white/70 line-clamp-1">{activity.description}</p>
                      </div>

                      <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/80" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Activities Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {activitiesHero.map((activity) => {
            const Icon = activity.icon;
            return (
              <Link
                key={activity.name}
                to={activity.name === "ByGagoos Ink" ? "/ink" : activity.name === "ByGagoos Trans" ? "/trans" : "/cda"}
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-gray-100 p-3">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">{activity.name === "ByGagoos CDA (Cuisine, Dégustation, Accueil)" ? "ByGagoos CDA" : activity.name}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{activity.description}</p>
                <p className="mt-6 text-sm font-semibold text-amber-700">Découvrir l'activité</p>
              </Link>
            );
          })}
        </motion.div>
      </section>

      {/* Three Activities Section */}
      <section id="activities" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Les trois activités
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Un seul système, trois espaces métier
            </h2>
          </div>
          <Link
            to="/prod/dashboard"
            className="hidden text-sm font-semibold text-gray-700 md:inline-flex hover:text-amber-700"
          >
            Accéder à la Direction Générale
          </Link>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {activityModules.map((module) => (
            <ActivityModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>

      {/* Galerie rapide - images du dossier /home/ */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Notre univers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez l'ambiance unique de ByGagoos Prod à travers nos espaces
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {homeGalleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl cursor-pointer group aspect-video"
            >
              <img
                src={image}
                alt={`ByGagoos Prod ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = "/images/logo.png"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Family Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-200"
        >
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Direction Générale
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              La Direction Générale
            </h2>
            <p className="mt-3 max-w-3xl text-gray-600">
              Retrouvez ici l'équipe dirigeante de ByGagoos Prod.
            </p>
          </div>
          <FamilyMembersGrid />
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {executivePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-amber-800 to-amber-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Heart className="h-10 w-10 mx-auto text-white mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Une question ? Un projet ?</h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
            Notre équipe est à votre écoute pour répondre à toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-amber-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              <Mail className="h-4 w-4" />
              Nous contacter
            </Link>
            <a
              href="tel:+261344359330"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-amber-200 text-sm">
            <Church className="h-4 w-4" />
            <span>"Par la grâce de Dieu, nous servons avec joie"</span>
            <Church className="h-4 w-4" />
          </div>
        </div>
      </section>
    </div>
  );
}