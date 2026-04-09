// frontend/src/components/layout/Footer.tsx

import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Icon } from "../ui/Icon";
import { Link } from "react-router-dom";

export default function Footer() {
  const links = {
    Produits: [
      { label: "Sérigraphie", href: "/gallery?category=serigraphie" },
      { label: "Design personnalisé", href: "/gallery?category=design" },
      { label: "Packaging", href: "/gallery?category=packaging" },
      { label: "Textile", href: "/gallery?category=textile" },
    ],
    Entreprise: [
      { label: "À propos", href: "/about" },
      { label: "Notre équipe", href: "/about#team" },
      { label: "Carrières", href: "/careers" },
      { label: "Presse", href: "/press" },
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
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com/bygagoos",
    },
  ];

  // Permet de remonter en haut de page lors d'un clic sur un lien du footer
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity w-fit"
            >
              <img
                src="/images/logo.png"
                alt="ByGagoos-Ink"
                className="h-12 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <span className="text-2xl font-bold text-white">
                ByGagoos<span className="text-blue-400">Ink</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-md">
              Nous transformons vos idées en œuvres d'art imprimées. Excellence
              en sérigraphie depuis 2025.
            </p>
            <div className="flex space-x-4">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
                  aria-label={item.label}
                >
                  <Icon icon={item.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-lg mb-6">
                {category}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      onClick={scrollToTop}
                      className="text-gray-400 hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Middle section - Contact */}
        <div className="border-t border-gray-800 pt-12 mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            <a 
              href="mailto:positifaid@live.fr" 
              className="flex items-center space-x-4 group"
            >
              <div className="p-3 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                <Icon icon={Mail} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white group-hover:text-blue-400 transition-colors">positifaid@live.fr</p>
              </div>
            </a>
            
            <a 
              href="tel:+261344335930" 
              className="flex items-center space-x-4 group"
            >
              <div className="p-3 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                <Icon icon={Phone} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Téléphone</p>
                <p className="text-white group-hover:text-blue-400 transition-colors">+261 34 43 359 30</p>
              </div>
            </a>
            
            <a 
              href="https://maps.google.com/?q=Antananarivo,Madagascar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-4 group"
            >
              <div className="p-3 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                <Icon icon={MapPin} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Adresse</p>
                <p className="text-white group-hover:text-blue-400 transition-colors">Antananarivo, Madagascar</p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">
                © {new Date().getFullYear()} ByGagoos Ink
              </span>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="text-gray-400 hidden sm:flex items-center">
                Made with <Heart size={16} className="text-red-500 mx-1 animate-pulse" /> in Madagascar
              </span>
            </div>
            <div className="flex text-sm text-gray-400 space-x-6">
              <Link
                to="/terms"
                onClick={scrollToTop}
                className="hover:text-white transition-colors"
              >
                Conditions d'utilisation
              </Link>
              <Link
                to="/privacy"
                onClick={scrollToTop}
                className="hover:text-white transition-colors"
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}