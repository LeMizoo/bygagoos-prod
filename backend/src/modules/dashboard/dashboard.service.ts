import User from '../users/user.model';
import Order, { 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod,
  IOrder, 
  IOrderDesign,
  IOrderMessage,
  IOrderHistory 
} from '../orders/order.model';
import Design, { DesignStatus, DesignType, IDesign } from '../designs/design.model';
import Client, { IClient } from '../clients/client.model';
import Staff from '../staff/staff.model';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';

// ========== INTERFACES ==========

interface TopClient {
  clientInfo: IClient | null;
  orderCount: number;
  totalSpent: number;
}

interface TopDesign {
  title: string;
  type: DesignType;
  status: DesignStatus;
  orderCount: number;
  popularity: number;
  viewCount: number;
}

interface OrderStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  archived: number;
  recentOrders7days?: number;
  byStatus: {
    pending: number;
    inProgress: number;
    review: number;
    modification: number;
    validated: number;
    production: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    archived: number;
  };
  paymentStatus?: {
    paid: number;
    pending: number;
    partial: number;
    refunded: number;
    cancelled: number;
  };
  byPriority?: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
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
  byPaymentMethod?: Record<PaymentMethod, number>;
}

interface ClientStats {
  total: number;
  active: number;
  newThisMonth?: number;
}

interface StaffStats {
  total: number;
  active: number;
  byRole?: {
    designers: number;
    validators: number;
    producers: number;
  };
}

interface UserStatsResponse {
  orders: {
    total: number;
    completed: number;
    active: number;
    cancelled: number;
  };
  spending: {
    total: number;
    average: number;
  };
  clients: number;
  designs: number;
  recentOrders: IOrder[];
}

interface AdminStatsResponse {
  orders: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    thisPeriod: number;
    previousPeriod: number;
    byStatus: {
      pending: number;
      draft: number;
      confirmed: number;
      inProgress: number;
      review: number;
      modification: number;
      validated: number;
      production: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      archived: number;
    };
    history: Array<{ date: string; count: number }>;
    recentOrders7days?: number;
  };
  designs: {
    total: number;
    active: number;
    draft: number;
    completed: number;
    popular: TopDesign[];
  };
  revenue: {
    thisPeriod: number;
    previousPeriod: number;
    ordersThisPeriod: number;
    history: Array<{ date: string; amount: number }>;
  };
  recentClients: IClient[];
  recentOrders: any[];
  alerts?: string[];
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
   * Calcule le total d'une commande à partir des designs
   */
  private calculateOrderTotal(order: IOrder): number {
    if (order.price?.total !== undefined && order.price.total !== null) {
      return order.price.total;
    }
    
    // Calcul à partir des designs
    if (order.designs && Array.isArray(order.designs)) {
      return order.designs.reduce((sum: number, design: IOrderDesign) => {
        return sum + (design.price * design.quantity);
      }, 0);
    }
    
    return 0;
  }

  /**
   * Vérifie si une commande est active
   */
  private isOrderActive(status: OrderStatus): boolean {
    const activeStatuses = [
      OrderStatus.PENDING,
      OrderStatus.IN_PROGRESS,
      OrderStatus.REVIEW,
      OrderStatus.MODIFICATION,
      OrderStatus.VALIDATED,
      OrderStatus.PRODUCTION,
      OrderStatus.SHIPPED
    ];
    return activeStatuses.includes(status);
  }

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
      const orders = await Order.find({}) as IOrder[];
      
      // Stats par statut
      const ordersByStatus = {
        pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
        inProgress: orders.filter(o => o.status === OrderStatus.IN_PROGRESS).length,
        review: orders.filter(o => o.status === OrderStatus.REVIEW).length,
        modification: orders.filter(o => o.status === OrderStatus.MODIFICATION).length,
        validated: orders.filter(o => o.status === OrderStatus.VALIDATED).length,
        production: orders.filter(o => o.status === OrderStatus.PRODUCTION).length,
        shipped: orders.filter(o => o.status === OrderStatus.SHIPPED).length,
        delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
        cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
        archived: orders.filter(o => o.status === OrderStatus.ARCHIVED).length
      };
      
      // Stats par priorité
      const byPriority = {
        low: orders.filter(o => o.priority === 'LOW').length,
        medium: orders.filter(o => o.priority === 'MEDIUM').length,
        high: orders.filter(o => o.priority === 'HIGH').length,
        urgent: orders.filter(o => o.priority === 'URGENT').length
      };
      
      // Commandes récentes (7 derniers jours)
      const recentOrders7days = orders.filter(o => {
        const daysDiff = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      }).length;
      
      // Commandes actives
      const activeOrders = orders.filter(o => this.isOrderActive(o.status)).length;
      
      // Commandes complétées
      const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
      const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;
      const archivedOrders = orders.filter(o => o.status === OrderStatus.ARCHIVED).length;
      
      // Revenus (seulement les commandes livrées)
      const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + this.calculateOrderTotal(o), 0);
      
      const averageRevenue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      // Revenus par méthode de paiement
      const revenueByPaymentMethod: Record<string, number> = {};
      deliveredOrders.forEach(order => {
        const method = order.payment?.method || 'OTHER';
        revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + this.calculateOrderTotal(order);
      });
      
      // ===== DESIGNS =====
      const designs = await Design.find({}) as IDesign[];
      
      // Designs actifs
      const activeDesigns = designs.filter(d => 
        d.status === DesignStatus.APPROVED || 
        d.status === DesignStatus.IN_PROGRESS
      ).length;
      
      // Designs en brouillon
      const draftDesigns = designs.filter(d => d.status === DesignStatus.DRAFT).length;
      
      // Designs complétés
      const completedDesigns = designs.filter(d => d.status === DesignStatus.COMPLETED).length;
      
      // ===== CLIENTS =====
      const clients = await Client.find({}) as IClient[];
      const activeClients = clients.filter(c => c.isActive !== false).length;
      const newClientsThisMonth = clients.filter(c => {
        const isThisMonth = new Date(c.createdAt).getMonth() === new Date().getMonth();
        const isThisYear = new Date(c.createdAt).getFullYear() === new Date().getFullYear();
        return isThisMonth && isThisYear;
      }).length;
      
      // ===== STAFF =====
      const staff = await Staff.find({});
      const activeStaff = staff.filter(s => s.isActive).length;
      
      // Stats staff par rôle
      const staffByRole = {
        designers: staff.filter(s => s.role === 'DESIGNER').length,
        validators: staff.filter(s => ['ADMIN', 'MANAGER'].includes(s.role)).length,
        producers: staff.filter(s => s.role === 'STAFF').length
      };
      
      // ===== TOP CLIENTS =====
      const topClientsRaw = await Order.aggregate([
        { $match: { status: OrderStatus.DELIVERED } },
        { $group: { 
            _id: '$client', 
            orderCount: { $sum: 1 }, 
            totalSpent: { $sum: '$price.total' } 
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
      
      const topClients: TopClient[] = topClientsRaw.map(c => ({
        clientInfo: c.clientInfo[0] || null,
        orderCount: c.orderCount || 0,
        totalSpent: c.totalSpent || 0
      }));
      
      // ===== TOP DESIGNS =====
      let topDesigns: TopDesign[] = [];
      try {
        const designsWithCount = await Order.aggregate([
          { $unwind: '$designs' },
          { $match: { 'designs.design': { $exists: true, $ne: null } } },
          { $group: { 
              _id: '$designs.design', 
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
          popularity: orders.length > 0 ? Math.round((d.orderCount / orders.length) * 100) : 0,
          viewCount: d.designInfo[0]?.viewCount || 0
        }));
      } catch (error) {
        logger.warn('⚠️ Erreur lors de la récupération des top designs:', error);
        topDesigns = [];
      }
      
      // Stats de paiement
      const paymentStats = {
        paid: orders.filter(o => o.payment?.status === PaymentStatus.PAID).length,
        pending: orders.filter(o => o.payment?.status === PaymentStatus.PENDING).length,
        partial: orders.filter(o => o.payment?.status === PaymentStatus.PARTIAL).length,
        refunded: orders.filter(o => o.payment?.status === PaymentStatus.REFUNDED).length,
        cancelled: orders.filter(o => o.payment?.status === PaymentStatus.CANCELLED).length
      };
      
      // Construction de la réponse
      const stats: SuperAdminStatsResponse = {
        users: {
          total: users.length,
          admins,
          regular: users.length - admins
        },
        orders: {
          total: orders.length,
          active: activeOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          archived: archivedOrders,
          recentOrders7days,
          byStatus: ordersByStatus,
          paymentStatus: paymentStats,
          byPriority
        },
        revenue: {
          total: totalRevenue,
          average: averageRevenue,
          byPaymentMethod: revenueByPaymentMethod as Record<PaymentMethod, number>
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
          active: activeClients,
          newThisMonth: newClientsThisMonth
        },
        staff: {
          total: staff.length,
          active: activeStaff,
          byRole: staffByRole
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
      
      const orders = await Order.find({}) as IOrder[];
      const designs = await Design.find({}) as IDesign[];
      const clients = await Client.find({}).sort({ createdAt: -1 }).limit(5) as IClient[];
      const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'firstName lastName email')
        .populate('designs.design', 'title type') as IOrder[];
      
      // Commandes actives
      const activeOrders = orders.filter(o => this.isOrderActive(o.status)).length;
      
      // Designs populaires (placeholder)
      const popularDesigns: TopDesign[] = [];
      
      // Commandes cette semaine
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      const ordersThisWeek = orders.filter(o => new Date(o.createdAt) >= thisWeek).length;
      
      const revenueThisWeek = orders
        .filter(o => o.status === OrderStatus.DELIVERED && new Date(o.createdAt) >= thisWeek)
        .reduce((sum, o) => sum + this.calculateOrderTotal(o), 0);
      
      return {
        orders: {
          total: orders.length,
          active: activeOrders,
          completed: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
          cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
          thisPeriod: orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= thirtyDaysAgo;
          }).length,
          previousPeriod: 0,
          byStatus: {
            pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
            draft: 0,
            confirmed: 0,
            inProgress: orders.filter(o => o.status === OrderStatus.IN_PROGRESS).length,
            review: orders.filter(o => o.status === OrderStatus.REVIEW).length,
            modification: orders.filter(o => o.status === OrderStatus.MODIFICATION).length,
            validated: orders.filter(o => o.status === OrderStatus.VALIDATED).length,
            production: orders.filter(o => o.status === OrderStatus.PRODUCTION).length,
            shipped: orders.filter(o => o.status === OrderStatus.SHIPPED).length,
            delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
            cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
            archived: 0
          },
          history: []
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
          thisPeriod: revenueThisWeek,
          previousPeriod: 0,
          ordersThisPeriod: ordersThisWeek,
          history: []
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
      const client = await Client.findOne({ email: user.email }) as IClient | null;
      
      if (!client) {
        // Utilisateur sans client associé
        return {
          orders: { total: 0, completed: 0, active: 0, cancelled: 0 },
          spending: { total: 0, average: 0 },
          clients: 0,
          designs: 0,
          recentOrders: []
        };
      }
      
      // Récupérer les commandes du client
      const orders = await Order.find({ client: client._id }) as IOrder[];
      const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
      const activeOrders = orders.filter(o => this.isOrderActive(o.status));
      const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
      
      // Calcul des dépenses
      const totalSpent = completedOrders.reduce((sum, o) => {
        return sum + this.calculateOrderTotal(o);
      }, 0);
      
      const averageSpent = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;
      
      // Commandes récentes
      const recentOrders = await Order.find({ client: client._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('designs.design', 'title type thumbnail') as IOrder[];
      
      // Designs associés au client
      const designs = await Design.find({ client: client._id }) as IDesign[];
      
      return {
        orders: {
          total: orders.length,
          completed: completedOrders.length,
          active: activeOrders.length,
          cancelled: cancelledOrders.length
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

type PeriodType = 'day' | 'week' | 'month' | 'year';

interface AdminStatsOptions {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
  orderStatus?: string;
}
