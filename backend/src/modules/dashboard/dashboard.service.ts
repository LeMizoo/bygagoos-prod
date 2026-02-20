import User from '../users/user.model';
import Order, { OrderStatus, PaymentStatus } from '../orders/order.model';
import Design, { DesignStatus, DesignType } from '../designs/design.model';
import Client from '../clients/client.model';
import Staff from '../staff/staff.model';
import logger from '../../core/utils/logger';

// ========== INTERFACES ==========

interface TopClient {
  clientInfo: any | null;
  orderCount: number;
  totalSpent: number;
}

interface TopDesign {
  title: string;
  type: DesignType;
  status: DesignStatus;
  orderCount: number;
  popularity: number;
}

interface OrderStats {
  total: number;
  active: number;
  completed: number;
  recentOrders7days?: number;
  byStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    completed: number;
    cancelled: number;
    refunded?: number;
  };
  paymentStatus?: {
    paid: number;
    pending: number;
    partiallyPaid: number;
    refunded: number;
    failed: number;
  };
}

interface DesignStats {
  total: number;
  active: number;
  draft: number;
  completed: number;
  byType?: {
    logo: number;
    branding: number;
    packaging: number;
    print: number;
    digital: number;
    illustration: number;
    other: number;
  };
  popular?: TopDesign[];
}

interface RevenueStats {
  total: number;
  average: number;
  thisWeek?: number;
  ordersThisWeek?: number;
}

interface ClientStats {
  total: number;
  active: number;
}

interface StaffStats {
  total: number;
  active: number;
}

interface UserStatsResponse {
  orders: {
    total: number;
    completed: number;
    active: number;
  };
  spending: {
    total: number;
    average: number;
  };
  clients: number;
  designs: number;
  recentOrders: any[];
}

interface AdminStatsResponse {
  orders: {
    total: number;
    active: number;
    completed: number;
    byStatus: {
      pending: number;
      confirmed: number;
      processing: number;
      completed: number;
      cancelled: number;
    };
  };
  designs: {
    total: number;
    active: number;
    draft: number;
    completed: number;
    popular: TopDesign[];
  };
  revenue: {
    thisWeek: number;
    ordersThisWeek: number;
  };
  recentClients: any[];
  recentOrders: any[];
}

interface SuperAdminStatsResponse {
  users: {
    total: number;
    admins: number;
    regular: number;
  };
  orders: OrderStats;
  revenue: RevenueStats;
  designs: DesignStats;
  clients: ClientStats;
  staff: StaffStats;
  topClients: TopClient[];
  topDesigns: TopDesign[];
  salesByDay: Array<{ date: string; count: number; revenue: number }>;
}

// ========== SERVICE ==========

class DashboardService {
  /**
   * Statistiques pour Super Admin
   */
  async getSuperAdminStats(): Promise<SuperAdminStatsResponse> {
    try {
      logger.debug('📊 Calcul des stats Super Admin...');
      
      // ===== UTILISATEURS =====
      const users = await User.find({});
      const admins = users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length;
      
      // ===== COMMANDES =====
      const orders = await Order.find({});
      
      // Stats par statut (utilisation des énumérations)
      const ordersByStatus = {
        pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
        confirmed: orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
        processing: orders.filter(o => o.status === OrderStatus.PROCESSING).length,
        completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
        cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
        refunded: orders.filter(o => o.status === OrderStatus.REFUNDED).length
      };
      
      // Commandes récentes (7 derniers jours)
      const recentOrders7days = orders.filter(o => {
        const daysDiff = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      }).length;
      
      // Revenus
      const totalRevenue = orders
        .filter(o => o.status === OrderStatus.COMPLETED)
        .reduce((sum, o) => sum + (o.total || 0), 0);
      
      const averageRevenue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      // ===== DESIGNS =====
      const designs = await Design.find({});
      
      // Designs actifs (APPROVED, IN_PROGRESS)
      const activeDesigns = designs.filter(d => 
        d.status === DesignStatus.APPROVED || 
        d.status === DesignStatus.IN_PROGRESS
      ).length;
      
      // Designs en brouillon
      const draftDesigns = designs.filter(d => d.status === DesignStatus.DRAFT).length;
      
      // Designs complétés
      const completedDesigns = designs.filter(d => d.status === DesignStatus.COMPLETED).length;
      
      // ===== CLIENTS =====
      const clients = await Client.find({});
      
      // ===== STAFF =====
      const staff = await Staff.find({});
      const activeStaff = staff.filter(s => s.isActive).length;
      
      // ===== TOP CLIENTS =====
      const topClientsRaw = await Order.aggregate([
        { $match: { status: OrderStatus.COMPLETED } },
        { $group: { 
            _id: '$client', 
            orderCount: { $sum: 1 }, 
            totalSpent: { $sum: { $ifNull: ['$total', 0] } } 
          } 
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
        { 
          $lookup: {
            from: 'clients',
            localField: '_id',
            foreignField: '_id',
            as: 'clientInfo'
          }
        }
      ]);
      
      // Typer les top clients
      const topClients: TopClient[] = topClientsRaw.map(c => ({
        clientInfo: c.clientInfo[0] || null,
        orderCount: c.orderCount || 0,
        totalSpent: c.totalSpent || 0
      }));
      
      // ===== TOP DESIGNS =====
      let topDesigns: TopDesign[] = [];
      try {
        // Récupérer les designs les plus utilisés dans les commandes
        const designsWithCount = await Order.aggregate([
          { $unwind: '$items' },
          { $match: { 'items.design': { $exists: true, $ne: null } } },
          { $group: { 
              _id: '$items.design', 
              orderCount: { $sum: 1 } 
            } 
          },
          { $sort: { orderCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'designs',
              localField: '_id',
              foreignField: '_id',
              as: 'designInfo'
            }
          }
        ]);
        
        topDesigns = designsWithCount.map(d => ({
          title: d.designInfo[0]?.title || 'Design inconnu',
          type: d.designInfo[0]?.type || DesignType.OTHER,
          status: d.designInfo[0]?.status || DesignStatus.DRAFT,
          orderCount: d.orderCount,
          popularity: orders.length > 0 ? Math.round((d.orderCount / orders.length) * 100) : 0
        }));
      } catch (error) {
        logger.warn('⚠️ Erreur lors de la récupération des top designs:', error);
        topDesigns = [];
      }
      
      // Construction de la réponse avec types explicites
      const stats: SuperAdminStatsResponse = {
        users: {
          total: users.length,
          admins,
          regular: users.length - admins
        },
        orders: {
          total: orders.length,
          active: orders.filter(o => 
            [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(o.status)
          ).length,
          completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
          recentOrders7days,
          byStatus: ordersByStatus,
          paymentStatus: {
            paid: orders.filter(o => o.paymentStatus === PaymentStatus.PAID).length,
            pending: orders.filter(o => o.paymentStatus === PaymentStatus.PENDING).length,
            partiallyPaid: orders.filter(o => o.paymentStatus === PaymentStatus.PARTIALLY_PAID).length,
            refunded: orders.filter(o => o.paymentStatus === PaymentStatus.REFUNDED).length,
            failed: orders.filter(o => o.paymentStatus === PaymentStatus.FAILED).length
          }
        },
        revenue: {
          total: totalRevenue,
          average: averageRevenue
        },
        designs: {
          total: designs.length,
          active: activeDesigns,
          draft: draftDesigns,
          completed: completedDesigns,
          byType: {
            logo: designs.filter(d => d.type === DesignType.LOGO).length,
            branding: designs.filter(d => d.type === DesignType.BRANDING).length,
            packaging: designs.filter(d => d.type === DesignType.PACKAGING).length,
            print: designs.filter(d => d.type === DesignType.PRINT).length,
            digital: designs.filter(d => d.type === DesignType.DIGITAL).length,
            illustration: designs.filter(d => d.type === DesignType.ILLUSTRATION).length,
            other: designs.filter(d => d.type === DesignType.OTHER).length
          },
          popular: topDesigns
        },
        clients: {
          total: clients.length,
          active: clients.filter(c => c.isActive !== false).length
        },
        staff: {
          total: staff.length,
          active: activeStaff
        },
        topClients,
        topDesigns,
        salesByDay: []
      };
      
      logger.info(`✅ Stats Super Admin calculées: ${orders.length} commandes, ${users.length} utilisateurs`);
      return stats;
      
    } catch (error) {
      logger.error('❌ Erreur calcul stats Super Admin:', error);
      throw error;
    }
  }
  
  /**
   * Statistiques pour Admin
   */
  async getAdminStats(): Promise<AdminStatsResponse> {
    try {
      logger.debug('📊 Calcul des stats Admin...');
      
      const orders = await Order.find({});
      const designs = await Design.find({});
      const clients = await Client.find({}).sort({ createdAt: -1 }).limit(5);
      const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'firstName lastName email')
        .populate('items.design', 'title type');
      
      // Commandes actives
      const activeOrders = orders.filter(o => 
        [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(o.status)
      ).length;
      
      // Designs populaires (placeholder)
      const popularDesigns: TopDesign[] = [];
      
      return {
        orders: {
          total: orders.length,
          active: activeOrders,
          completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
          byStatus: {
            pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
            confirmed: orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
            processing: orders.filter(o => o.status === OrderStatus.PROCESSING).length,
            completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
            cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length
          }
        },
        designs: {
          total: designs.length,
          active: designs.filter(d => 
            [DesignStatus.APPROVED, DesignStatus.IN_PROGRESS].includes(d.status)
          ).length,
          draft: designs.filter(d => d.status === DesignStatus.DRAFT).length,
          completed: designs.filter(d => d.status === DesignStatus.COMPLETED).length,
          popular: popularDesigns
        },
        revenue: {
          thisWeek: 0, // À implémenter
          ordersThisWeek: 0 // À implémenter
        },
        recentClients: clients,
        recentOrders
      };
      
    } catch (error) {
      logger.error('❌ Erreur calcul stats Admin:', error);
      throw error;
    }
  }
  
  /**
   * Statistiques pour User
   */
  async getUserStats(userId: string): Promise<UserStatsResponse> {
    try {
      logger.debug(`📊 Calcul des stats User pour ${userId}...`);
      
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }
      
      // Récupérer l'utilisateur
      const user = await User.findById(userId);
      if (!user) throw new Error('Utilisateur non trouvé');
      
      // Chercher le client associé à cet email
      const client = await Client.findOne({ email: user.email });
      
      if (!client) {
        // Utilisateur sans client associé
        return {
          orders: { total: 0, completed: 0, active: 0 },
          spending: { total: 0, average: 0 },
          clients: 0,
          designs: 0,
          recentOrders: []
        };
      }
      
      // Récupérer les commandes du client
      const orders = await Order.find({ client: client._id });
      const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
      
      // Calcul des dépenses
      const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const averageSpent = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;
      
      // Commandes récentes
      const recentOrders = await Order.find({ client: client._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('items.design', 'title type thumbnail');
      
      // Designs associés au client
      const designs = await Design.find({ client: client._id });
      
      return {
        orders: {
          total: orders.length,
          completed: completedOrders.length,
          active: orders.filter(o => 
            [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(o.status)
          ).length
        },
        spending: {
          total: totalSpent,
          average: averageSpent
        },
        clients: 1,
        designs: designs.length,
        recentOrders
      };
      
    } catch (error) {
      logger.error('❌ Erreur calcul stats User:', error);
      throw error;
    }
  }
}

export default new DashboardService();