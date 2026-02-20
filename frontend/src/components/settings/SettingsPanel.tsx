// frontend/src/components/settings/SettingsPanel.tsx
import React, { useState } from "react";
import {
  X,
  Settings,
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    iconVisibility,
    setTheme,
    setIconVisibility,
    toggleTheme,
    toggleIcons,
  } = useTheme();

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        title="Paramètres"
      >
        <Settings size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Panel */}
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Settings
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Préférences
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Thème */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Thème
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Sun size={24} className="mb-2 text-yellow-500" />
                    <span className="text-sm font-medium">Clair</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Moon size={24} className="mb-2 text-indigo-500" />
                    <span className="text-sm font-medium">Sombre</span>
                  </button>
                  <button
                    onClick={() => setTheme("auto")}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                      theme === "auto"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Monitor size={24} className="mb-2 text-gray-500" />
                    <span className="text-sm font-medium">Auto</span>
                  </button>
                </div>
              </div>

              {/* Icônes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Icônes
                  </h3>
                  <button
                    onClick={toggleIcons}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Basculer
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setIconVisibility("show")}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                      iconVisibility === "show"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Eye size={24} className="mb-2 text-green-500" />
                    <span className="text-sm font-medium">Tout voir</span>
                  </button>
                  <button
                    onClick={() => setIconVisibility("minimal")}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                      iconVisibility === "minimal"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Sparkles size={24} className="mb-2 text-yellow-500" />
                    <span className="text-sm font-medium">Minimal</span>
                  </button>
                  <button
                    onClick={() => setIconVisibility("hide")}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                      iconVisibility === "hide"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <EyeOff size={24} className="mb-2 text-red-500" />
                    <span className="text-sm font-medium">Cacher</span>
                  </button>
                </div>
              </div>

              {/* Statut actuel */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Configuration actuelle
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Thème:</span>
                    <span className="font-medium">
                      {theme === "light"
                        ? "Clair"
                        : theme === "dark"
                          ? "Sombre"
                          : "Automatique"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Icônes:</span>
                    <span className="font-medium">
                      {iconVisibility === "show"
                        ? "Toutes visibles"
                        : iconVisibility === "minimal"
                          ? "Minimales"
                          : "Cachées"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t dark:border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
