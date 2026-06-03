import { useState } from 'react';
import { 
  FileText, Download, Calendar, Users, 
  TrendingUp, Printer, Loader2,
  BarChart3
} from 'lucide-react';
import { pdfExport, type TripReport, type DriverStats } from '../../utils/pdfExport';
import taxiApi from '../../api/taxi.api';
import toast from 'react-hot-toast';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'drivers';

export default function TaxiReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const reportTypes = [
    { id: 'daily' as const, label: 'Rapport journalier', icon: Calendar, description: 'Courses du jour avec détails' },
    { id: 'weekly' as const, label: 'Rapport hebdomadaire', icon: TrendingUp, description: 'Statistiques de la semaine' },
    { id: 'monthly' as const, label: 'Rapport mensuel', icon: BarChart3, description: 'Bilan complet du mois' },
    { id: 'drivers' as const, label: 'Classement chauffeurs', icon: Users, description: 'Performance par chauffeur' },
  ];

  // Générer des données mockées pour les rapports (en attendant l'API backend)
  const generateMockTrips = (): TripReport[] => {
    const mockDrivers = ['Jean Rakoto', 'Paul Razafy', 'Marie Randria', 'Marc Andria'];
    const mockLocations = ['Aéroport', 'Centre ville', 'Gare routière', 'Mahamasina', 'Analakely', 'Andraharo'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `trip-${i}`,
      date: new Date().toISOString(),
      driverName: mockDrivers[Math.floor(Math.random() * mockDrivers.length)],
      vehiclePlate: `${Math.floor(Math.random() * 9000) + 1000}TMA`,
      pickupLocation: mockLocations[Math.floor(Math.random() * mockLocations.length)],
      dropLocation: mockLocations[Math.floor(Math.random() * mockLocations.length)],
      distance: Math.floor(Math.random() * 30) + 5,
      fare: Math.floor(Math.random() * 25000) + 5000,
      status: Math.random() > 0.2 ? 'COMPLETED' : 'IN_PROGRESS'
    }));
  };

  const generateMockDrivers = (): DriverStats[] => {
    return [
      { driverId: '1', driverName: 'Jean Rakoto', totalTrips: 48, totalDistance: 1250, totalRevenue: 450000, averageRating: 4.9 },
      { driverId: '2', driverName: 'Paul Razafy', totalTrips: 45, totalDistance: 1180, totalRevenue: 420000, averageRating: 4.8 },
      { driverId: '3', driverName: 'Marie Randria', totalTrips: 42, totalDistance: 1100, totalRevenue: 390000, averageRating: 4.9 },
      { driverId: '4', driverName: 'Marc Andria', totalTrips: 38, totalDistance: 980, totalRevenue: 350000, averageRating: 4.7 },
      { driverId: '5', driverName: 'Sophie Rabe', totalTrips: 35, totalDistance: 920, totalRevenue: 320000, averageRating: 4.8 },
    ];
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      switch (reportType) {
        case 'daily':
          await generateDailyReport();
          break;
        case 'weekly':
          await generateWeeklyReport();
          break;
        case 'monthly':
          await generateMonthlyReport();
          break;
        case 'drivers':
          await generateDriversReport();
          break;
      }
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyReport = async () => {
    const trips = generateMockTrips();
    
    await pdfExport.exportDailyTripsReport(trips, {
      title: 'Rapport journalier des courses',
      subtitle: 'ByGagoos Trans',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      logo: '/logo.png'
    });
    
    toast.success('Rapport généré avec succès');
  };

  const generateWeeklyReport = async () => {
    const trips = generateMockTrips();
    
    await pdfExport.exportDailyTripsReport(trips, {
      title: 'Rapport hebdomadaire des courses',
      subtitle: 'ByGagoos Trans',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      logo: '/logo.png'
    });
    
    toast.success('Rapport généré avec succès');
  };

  const generateMonthlyReport = async () => {
    const trips = generateMockTrips();
    
    await pdfExport.exportDailyTripsReport(trips, {
      title: 'Rapport mensuel des courses',
      subtitle: 'ByGagoos Trans',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      logo: '/logo.png'
    });
    
    toast.success('Rapport généré avec succès');
  };

  const generateDriversReport = async () => {
    const driversStats = generateMockDrivers();
    
    await pdfExport.exportDriversReport(driversStats, {
      title: 'Classement des chauffeurs',
      subtitle: 'Performance par chauffeur',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      logo: '/logo.png'
    });
    
    toast.success('Rapport généré avec succès');
  };

  const handleScreenshot = async () => {
    await pdfExport.exportDashboardScreenshot('taxi-dashboard', 'dashboard-taxi');
    toast.success('Capture d\'écran exportée');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-600" />
            Rapports & Export
          </h1>
          <p className="text-gray-500 mt-1">Générez et exportez des rapports PDF pour l'activité Taxi</p>
        </div>
        <button
          onClick={handleScreenshot}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
          title="Capturer l'écran du tableau de bord"
        >
          <Printer className="h-4 w-4" />
          Capture écran
        </button>
      </div>

      {/* Types de rapport */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isActive = reportType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? 'border-cyan-500 bg-cyan-50 shadow-md'
                  : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
              }`}
              title={`Sélectionner ${type.label}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${isActive ? 'text-cyan-700' : 'text-gray-700'}`}>
                  {type.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{type.description}</p>
            </button>
          );
        })}
      </div>

      {/* Paramètres */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres du rapport</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg p-2"
              title="Date de début de la période"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg p-2"
              title="Date de fin de la période"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50"
            title="Générer le rapport PDF"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {loading ? 'Génération en cours...' : 'Générer le rapport PDF'}
          </button>
        </div>
      </div>

      {/* Info bulles */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Rapport journalier</span>
          </div>
          <p className="text-sm text-blue-700">Détail complet des courses, revenus et kilométrage par jour</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Rapport périodique</span>
          </div>
          <p className="text-sm text-green-700">Analyse hebdomadaire/mensuelle avec graphiques de tendance</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Classement chauffeurs</span>
          </div>
          <p className="text-sm text-purple-700">Performance individuelle, revenus et note moyenne</p>
        </div>
      </div>
    </div>
  );
}