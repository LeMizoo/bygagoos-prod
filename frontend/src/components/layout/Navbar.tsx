import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  User,
  LogOut,
  LogIn,
  ShoppingBag,
  Settings,
  ChevronDown,
  Palette,
  Bike,
  UtensilsCrossed,
  Menu,
  X,
  Home,
  Info,
  Phone,
  GalleryVertical,
  LayoutDashboard,
  Crown,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);

  // Fermer le menu mobile quand la fenêtre est redimensionnée en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setActivitiesOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setActivitiesOpen(false);
    setUserMenuOpen(false);
  };

  // Liens principaux pour desktop et mobile
  const mainLinks = [
    { to: "/home", label: "Accueil", icon: Home },
    { to: "/about", label: "À propos", icon: Info },
    { to: "/gallery", label: "Galerie", icon: GalleryVertical },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  // Activités
  const activities = [
    { to: "/ink", label: "ByGagoos Ink (Sérigraphie)", icon: Palette, color: "text-purple-600", bgHover: "hover:bg-purple-50" },
    { to: "/trans", label: "ByGagoos Trans (Taxi Moto)", icon: Bike, color: "text-cyan-600", bgHover: "hover:bg-cyan-50" },
    { to: "/cda", label: "ByGagoos CDA (Cuisine, Dégustation, Accueil)", icon: UtensilsCrossed, color: "text-amber-600", bgHover: "hover:bg-amber-50" },
  ];

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et brand */}
            <Link to="/home" className="flex items-center space-x-2 flex-shrink-0" onClick={closeAllMenus}>
              <img
                src="/images/logo.png"
                alt="ByGagoos Prod"
                className="h-10 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <span className="font-bold text-gray-900 hidden sm:inline">
                ByGagoos Prod
              </span>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {mainLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Menu déroulant Nos Activités */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Nos Activités</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <Link
                        key={activity.to}
                        to={activity.to}
                        className={`flex items-center gap-3 px-4 py-2.5 text-gray-700 transition-colors ${activity.bgHover}`}
                      >
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                        <span className="text-sm">{activity.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions utilisateur et bouton mobile */}
            <div className="flex items-center space-x-4">
              {/* Desktop User Menu */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{user?.firstName}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ").toLowerCase()}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                            <div className="mt-1">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {user?.role?.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          <div className="py-2">
                            <Link to="/user/profile" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              <User className="h-4 w-4 mr-3 text-gray-400" />
                              Mon profil
                            </Link>
                            <Link to="/user/my-orders" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              <ShoppingBag className="h-4 w-4 mr-3 text-gray-400" />
                              Mes commandes
                            </Link>
                            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                              <>
                                <Link to="/prod/dashboard" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                                  <Crown className="h-4 w-4 mr-3 text-amber-600" />
                                  Direction Générale
                                </Link>
                                <Link to="/admin/settings" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                                  <Settings className="h-4 w-4 mr-3 text-gray-400" />
                                  Paramètres admin
                                </Link>
                              </>
                            )}
                          </div>

                          <div className="border-t border-gray-100 pt-2">
                            <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50">
                              <LogOut className="h-4 w-4 mr-3" />
                              Déconnexion
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link to="/auth/login" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                      <LogIn size={18} />
                      <span>Connexion</span>
                    </Link>
                    <Link to="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>

              {/* Bouton menu mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobile - Plein écran avec overlay */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } navbar-mobile-menu`}
      >
        <div className="h-full overflow-y-auto pb-20">
          <div className="px-4 py-6 space-y-6">
            {/* Section utilisateur mobile */}
            {user ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {user?.role?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link to="/user/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeAllMenus}>
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                  <Link to="/user/my-orders" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeAllMenus}>
                    <ShoppingBag className="h-4 w-4" />
                    Mes commandes
                  </Link>
                  {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <>
                      <Link to="/prod/dashboard" className="flex items-center gap-3 px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg" onClick={closeAllMenus}>
                        <Crown className="h-4 w-4" />
                        Direction Générale
                      </Link>
                      <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeAllMenus}>
                        <Settings className="h-4 w-4" />
                        Paramètres admin
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/auth/login" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium" onClick={closeAllMenus}>
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Link>
                <Link to="/auth/register" className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50" onClick={closeAllMenus}>
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Séparateur */}
            <div className="border-t border-gray-200"></div>

            {/* Liens principaux mobile */}
            <div className="space-y-1">
              {mainLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={closeAllMenus}
                  >
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Activités mobile (accordéon) */}
            <div>
              <button
                onClick={() => setActivitiesOpen(!activitiesOpen)}
                className="flex items-center justify-between w-full px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Nos Activités</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${activitiesOpen ? "rotate-180" : ""}`} />
              </button>
              
              {activitiesOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l-2 border-amber-200 pl-4">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <Link
                        key={activity.to}
                        to={activity.to}
                        className={`flex items-center gap-3 px-3 py-3 text-gray-700 rounded-lg transition-colors ${activity.bgHover}`}
                        onClick={closeAllMenus}
                      >
                        <Icon className={`h-5 w-5 ${activity.color}`} />
                        <span className="text-sm">{activity.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Petit message de foi en bas du menu mobile */}
            <div className="pt-8 pb-4 text-center">
              <div className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Heart className="h-3 w-3" />
                <span>Par la grâce de Dieu</span>
                <Heart className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay sombre quand menu mobile est ouvert */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden navbar-overlay"
          onClick={closeAllMenus}
        />
      )}
    </>
  );
}