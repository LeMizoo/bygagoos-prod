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
  },
  {
    name: "ByGagoos Trans",
    icon: Bike,
    color: "from-cyan-500 to-cyan-600",
    bgGradient: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10",
    description: "Flotte Taxi-Moto, conducteurs, maintenance et missions.",
  },
  {
    name: "ByGagoos CDA (Cuisine, Dégustation, Accueil)",
    icon: UtensilsCrossed,
    color: "from-amber-500 to-amber-600",
    bgGradient: "bg-gradient-to-br from-amber-500/20 to-amber-600/10",
    description: "Bar / restaurant, réservations, salle et exploitation.",
  },
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
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 rounded-full bg-amber-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Column - Text (style AgileFleet mais contenu ByGagoos) */}
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
                Une maison familiale, trois activités, une direction générale unique et un socle
                technique commun.
              </p>
              <p className="mt-4 text-base leading-7 text-white/60 max-w-2xl">
                ByGagoos Prod rassemble la sérigraphie, le Taxi-Moto et le bar-restaurant dans une
                même application modulaire.
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

              {/* Stats - style AgileFleet */}
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

            {/* Right Column - Three Activities Cards (style AgileFleet) */}
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
                      {/* Icon avec dégradé */}
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${activity.color} shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{activity.name}</h3>
                        <p className="text-sm text-white/70">{activity.description}</p>
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

      {/* Activities Highlights - inchangé */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Link
            to="/ink"
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-purple-100 p-3">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">ByGagoos Ink</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Designs, commandes, production et galerie publique.
            </p>
            <p className="mt-6 text-sm font-semibold text-amber-700">Découvrir l'activité</p>
          </Link>

          <Link
            to="/trans"
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-cyan-100 p-3">
                <Truck className="h-5 w-5 text-cyan-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">ByGagoos Trans</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Flotte Taxi-Moto, conducteurs, maintenance et missions.
            </p>
            <p className="mt-6 text-sm font-semibold text-amber-700">Découvrir l'activité</p>
          </Link>

          <Link
            to="/cda"
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-amber-100 p-3">
                <UtensilsCrossed className="h-5 w-5 text-amber-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              ByGagoos CDA (Cuisine, Dégustation, Accueil)
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Bar / restaurant, réservations, salle et exploitation.
            </p>
            <p className="mt-6 text-sm font-semibold text-amber-700">Découvrir l'activité</p>
          </Link>
        </motion.div>
      </section>

      {/* Three Activities Section - inchangé */}
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

      {/* Family Section - inchangé */}
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
              Le noyau familial qui pilote ByGagoos Prod
            </h2>
            <p className="mt-3 max-w-3xl text-gray-600">
              La gouvernance reste familiale. Tovoniaina RAHENDRISON garde le rôle de super admin,
              entouré de trois autres membres administratifs de la famille. Les noms peuvent être
              complétés ensuite si tu veux les afficher publiquement.
            </p>
          </div>
          <FamilyMembersGrid />
        </motion.div>
      </section>

      {/* Values Section - inchangé */}
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

      {/* Footer CTA - inchangé */}
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