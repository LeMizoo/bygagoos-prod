// frontend/src/components/layout/Footer.tsx

import { Facebook, Instagram, Mail, Phone, MapPin, Heart, Bike, UtensilsCrossed, Palette, ArrowUpRight, Sparkles } from "lucide-react";
import { Icon } from "../ui/Icon";
import { Link } from "react-router-dom";

export default function Footer() {
  const links = {
    "ByGagoos Ink": [
      { label: "Sérigraphie", href: "/ink" },
      { label: "Design personnalisé", href: "/gallery?category=design" },
      { label: "Galerie", href: "/gallery" },
    ],
    "ByGagoos Trans": [
      { label: "Flotte Taxi-Moto", href: "/trans" },
      { label: "Gestion véhicules", href: "/admin/taxi/vehicles" },
      { label: "Courses du jour", href: "/trans" },
    ],
    "ByGagoos CDA": [
      { label: "Réservations", href: "/cda" },
      { label: "Menu du jour", href: "/cda" },
      { label: "Gestion des tables", href: "/cda" },
    ],
    Support: [
      { label: "Centre d'aide", href: "/help" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Retours", href: "/returns" },
    ],
    Légal: [
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  };

  const social = [
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://facebook.com/bygagoos",
      color: "hover:bg-blue-600",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com/bygagoos",
      color: "hover:bg-pink-600",
    },
  ];

  const activities = [
    { name: "Ink", icon: Palette, color: "from-purple-500 to-purple-600", bgHover: "hover:border-purple-400/50 group-hover:text-purple-400", href: "/ink" },
    { name: "Trans", icon: Bike, color: "from-cyan-500 to-cyan-600", bgHover: "hover:border-cyan-400/50 group-hover:text-cyan-400", href: "/trans" },
    { name: "CDA", icon: UtensilsCrossed, color: "from-amber-500 to-amber-600", bgHover: "hover:border-amber-400/50 group-hover:text-amber-400", href: "/cda" },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section - Grid avec style moderne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Logo et description - style AgileFleet */}
          <div className="lg:col-span-2">
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity w-fit group"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-amber-500 rounded-full opacity-0 group-hover:opacity-75 blur transition duration-500"></div>
                <img
                  src="/images/logo.png"
                  alt="ByGagoos Prod"
                  className="relative h-12 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                ByGagoos<span className="text-white">Prod</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              <strong className="text-white">ByGagoos Prod</strong> regroupe trois activités complémentaires :
            </p>
            <div className="space-y-3 mb-8">
              {activities.map((activity) => (
                <Link
                  key={activity.name}
                  to={activity.href}
                  onClick={scrollToTop}
                  className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${activity.color} flex items-center justify-center`}>
                      <activity.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      ByGagoos {activity.name}
                    </span>
                  </div>
                  <ArrowUpRight className={`h-4 w-4 text-gray-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${activity.bgHover}`} />
                </Link>
              ))}
            </div>
            <div className="flex space-x-3">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-300 ${item.color} hover:text-white hover:scale-110`}
                  aria-label={item.label}
                >
                  <Icon icon={item.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links - style moderne */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                {category}
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-amber-500 to-transparent rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      onClick={scrollToTop}
                      className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm group"
                    >
                      {item.label}
                      <span className="block h-px w-0 bg-gradient-to-r from-amber-500 to-transparent group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Middle section - Contact Cards (style AgileFleet) */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="mailto:positifaid@live.fr" 
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:scale-[1.02] hover:border-white/20"
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white group-hover:text-blue-400 transition-colors">positifaid@live.fr</p>
              </div>
            </a>
            
            <a 
              href="tel:+261344335930" 
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:scale-[1.02] hover:border-white/20"
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 group-hover:scale-110 transition-transform">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Téléphone</p>
                <p className="text-white group-hover:text-green-400 transition-colors">+261 34 43 359 30</p>
              </div>
            </a>
            
            <a 
              href="https://maps.google.com/?q=Antananarivo,Madagascar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:scale-[1.02] hover:border-white/20"
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 group-hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Adresse</p>
                <p className="text-white group-hover:text-amber-400 transition-colors">Antananarivo, Madagascar</p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">
                © {new Date().getFullYear()} ByGagoos Prod
              </span>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="text-gray-400 hidden sm:flex items-center gap-1 text-sm">
                Made with <Heart size={14} className="text-red-500 animate-pulse" /> in Madagascar
              </span>
            </div>
            <div className="flex text-sm text-gray-400 space-x-6">
              <Link
                to="/terms"
                onClick={scrollToTop}
                className="hover:text-white transition-colors relative group"
              >
                Conditions d'utilisation
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/privacy"
                onClick={scrollToTop}
                className="hover:text-white transition-colors relative group"
              >
                Politique de confidentialité
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkle decoration */}
      <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none">
        <Sparkles className="h-32 w-32 text-white" />
      </div>
    </footer>
  );
}