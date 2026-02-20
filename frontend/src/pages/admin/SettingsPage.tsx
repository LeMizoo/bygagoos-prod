export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Configurez votre espace d'administration
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4 text-4xl">⚙️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Paramètres en construction
        </h3>
        <p className="text-gray-600 mb-4">
          Cette section est en cours de développement. Elle permettra de
          configurer tous les paramètres de votre plateforme.
        </p>
        <div className="max-w-md mx-auto space-y-4 text-left">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Notifications par email</span>
            <div className="bg-blue-600 w-10 h-6 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Mode maintenance</span>
            <div className="bg-gray-300 w-10 h-6 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Analytics Google</span>
            <div className="bg-blue-600 w-10 h-6 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
