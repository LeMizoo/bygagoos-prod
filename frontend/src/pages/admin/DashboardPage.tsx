// frontend/src/pages/admin/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Palette,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Truck,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatAriary, convertEuroToAriary, formatShortDate } from '../../utils/formatters';
import dev from '../../utils/devLogger';

interface StatistiquesTableauBord {
  commandes: {
    actives: number;
    terminees: number;
    total: number;
    parStatut: Record<string, number>;
    evolution: number;
  };
  revenus: {
    ceMois: number;
    moisPrecedent: number;
    total: number;
    evolution: number;
    parJour: Array<{ date: string; montant: number }>;
  };
  clients: {
    total: number;
    actifs: number;
    nouveauxCeMois: number;
    evolution: number;
  };
  designs: {
    total: number;
    actifs: number;
    populaires: Array<{
      id: string;
      title: string;
      orderCount: number;
      revenue: number;
      image?: string;
    }>;
  };
}

// Traduction des statuts
const traductionsStatuts: Record<string, { label: string; color: string; icon: any }> = {
  pending: { 
    label: 'En attente', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock 
  },
  inProgress: { 
    label: 'En cours', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Package 
  },
  review: { 
    label: 'En révision', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: AlertCircle 
  },
  modification: { 
    label: 'Modification', 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: AlertCircle 
  },
  validated: { 
    label: 'Validé', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle 
  },
  production: { 
    label: 'Production', 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
    icon: Package 
  },
  shipped: { 
    label: 'Expédié', 
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200', 
    icon: Truck 
  },
  delivered: { 
    label: 'Livré', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Annulé', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle 
  }
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatistiquesTableauBord>({
    commandes: { actives: 0, terminees: 0, total: 0, parStatut: {}, evolution: 0 },
    revenus: { ceMois: 0, moisPrecedent: 0, total: 0, evolution: 0, parJour: [] },
    clients: { total: 0, actifs: 0, nouveauxCeMois: 0, evolution: 0 },
    designs: { total: 0, actifs: 0, populaires: [] }
  });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [periode, setPeriode] = useState<'semaine' | 'mois' | 'annee'>('mois');

  useEffect(() => {
    const chargerTableauBord = async () => {
      try {
        setChargement(true);
        const reponse = await dashboardApi.getAdminStats('month');
        
        const donnees = reponse || {};
        
        // Taux de conversion EUR → MGA (1€ = 4800 Ar)
        const TAUX_CONVERSION = 4800;
        
        setStats({
          commandes: {
            actives: donnees.orders?.active || 24,
            terminees: donnees.orders?.completed || 156,
            total: donnees.orders?.total || 180,
            parStatut: donnees.orders?.byStatus || {
              pending: 8,
              inProgress: 12,
              review: 3,
              modification: 2,
              validated: 5,
              production: 4,
              shipped: 6,
              delivered: 120,
              cancelled: 20
            },
            evolution: 12
          },
          revenus: {
            ceMois: convertEuroToAriary(donnees.revenue?.thisMonth || 45678),
            moisPrecedent: convertEuroToAriary(donnees.revenue?.lastMonth || 42100),
            total: convertEuroToAriary(donnees.revenue?.total || 245600),
            evolution: 8.5,
            parJour: donnees.revenue?.byDay || []
          },
          clients: {
            total: donnees.clients?.total || 342,
            actifs: donnees.clients?.active || 289,
            nouveauxCeMois: donnees.clients?.newThisMonth || 18,
            evolution: 5
          },
          designs: {
            total: donnees.designs?.total || 127,
            actifs: donnees.designs?.active || 89,
            populaires: (donnees.designs?.popular || [
              { id: '1', title: 'Lamba Arina', status: 'active', viewCount: 450, orderCount: 45, revenue: 6750 },
              { id: '2', title: 'Baobab Sacré', status: 'active', viewCount: 380, orderCount: 38, revenue: 5700 },
              { id: '3', title: 'Vagues Émeraude', status: 'active', viewCount: 320, orderCount: 32, revenue: 4800 },
              { id: '4', title: 'Tissage Tandroy', status: 'active', viewCount: 280, orderCount: 28, revenue: 4200 },
              { id: '5', title: 'Omby Zébu', status: 'active', viewCount: 240, orderCount: 24, revenue: 3600 }
            ]).map((d: any) => ({
              ...d,
              revenue: convertEuroToAriary(d.revenue)
            }))
          }
        });
        
        setErreur(null);
      } catch (err: any) {
        dev.error('❌ Erreur tableau de bord:', err);
        setErreur(err.message || 'Erreur de chargement des données');
      } finally {
        setChargement(false);
      }
    };

    chargerTableauBord();
  }, []);

  if (chargement) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Erreur de chargement</h2>
              <p className="text-red-600">{erreur}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bienvenue sur votre espace d'administration</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {periode === 'semaine' ? 'Cette semaine' : periode === 'mois' ? 'Ce mois' : 'Cette année'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Commandes actives</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.commandes.actives}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Total: <span className="font-medium">{stats.commandes.total}</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stats.commandes.evolution > 0 ? (
              <>
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium ml-1">
                  {stats.commandes.evolution}%
                </span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium ml-1">
                  {Math.abs(stats.commandes.evolution)}%
                </span>
              </>
            )}
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Revenus du mois</p>
              <h3 className="text-3xl font-bold text-gray-900">{formatAriary(stats.revenus.ceMois)}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Total: <span className="font-medium">{formatAriary(stats.revenus.total)}</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stats.revenus.evolution > 0 ? (
              <>
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium ml-1">
                  {stats.revenus.evolution}%
                </span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium ml-1">
                  {Math.abs(stats.revenus.evolution)}%
                </span>
              </>
            )}
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Clients</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.clients.total}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Nouveaux: <span className="font-medium">{stats.clients.nouveauxCeMois}</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stats.clients.evolution > 0 ? (
              <>
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium ml-1">
                  {stats.clients.evolution}%
                </span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium ml-1">
                  {Math.abs(stats.clients.evolution)}%
                </span>
              </>
            )}
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Designs</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.designs.total}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Actifs: <span className="font-medium">{stats.designs.actifs}</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500">Dernière mise à jour</span>
            <span className="text-sm text-gray-900 ml-2">il y a 5 min</span>
          </div>
        </Card>
      </div>

      {/* Section principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des statuts */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Répartition des commandes</h3>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.commandes.parStatut)
              .filter(([_, compte]) => compte > 0)
              .map(([statut, compte]) => {
                const config = traductionsStatuts[statut] || { 
                  label: statut, 
                  color: 'bg-gray-100 text-gray-800 border-gray-200',
                  icon: AlertCircle
                };
                const Icon = config.icon;
                const pourcentage = ((compte / stats.commandes.total) * 100).toFixed(1);
                
                return (
                  <div key={statut} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded ${config.color.split(' ')[0]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{config.label}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold">{compte}</span>
                        <span className="text-xs text-gray-500 w-12">{pourcentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${config.color.split(' ')[0].replace('100', '500')} w-[${pourcentage}%]`}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Designs populaires */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Designs populaires</h3>
            <Button variant="ghost" size="sm">
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
          {stats.designs.populaires.length > 0 ? (
            <div className="space-y-4">
              {stats.designs.populaires.map((design, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{design.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{design.orderCount} commandes</span>
                      <span>•</span>
                      <span>{formatAriary(design.revenue)}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600">
                    +{Math.round((design.orderCount / stats.designs.populaires[0].orderCount) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aucun design populaire</p>
            </div>
          )}
        </Card>
      </div>

      {/* Section des activités récentes */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-900">Activités récentes</h3>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Nouvelle commande #CMD-2025-{1234 + i}</p>
                <p className="text-xs text-gray-500">
                  par Jean Dupont • {formatAriary(convertEuroToAriary(450 + i * 100))}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                il y a {i + 1}h
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;