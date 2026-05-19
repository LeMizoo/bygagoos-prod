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
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center space-x-8">
            <Link to="/home" className="flex items-center space-x-2">
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

            <div className="hidden md:flex space-x-6">
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                À propos
              </Link>
              
              {/* Menu déroulant Nos Activités */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                  Nos Activités
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    to="/ink"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    <Palette className="h-4 w-4 text-purple-600" />
                    <span>ByGagoos Ink</span>
                  </Link>
                  <Link
                    to="/trans"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    <Bike className="h-4 w-4 text-cyan-600" />
                    <span>ByGagoos Trans</span>
                  </Link>
                  <Link
                    to="/cda"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                    <span>ByGagoos CDA</span>
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role?.replace("_", " ").toLowerCase()}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {user?.email}
                        </p>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {user?.role?.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/user/profile"
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400" />
                          Mon profil
                        </Link>

                        <Link
                          to="/user/my-orders"
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-3 text-gray-400" />
                          Mes commandes
                        </Link>

                        {(user.role === "ADMIN" ||
                          user.role === "SUPER_ADMIN") && (
                          <>
                            <Link
                              to="/prod/dashboard"
                              className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 mr-3 text-gray-400" />
                              Direction Générale
                            </Link>

                            <Link
                              to="/admin/settings"
                              className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 mr-3 text-gray-400" />
                              Paramètres admin
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogIn size={18} />
                  <span>Connexion</span>
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}