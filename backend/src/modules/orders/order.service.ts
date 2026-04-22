import { Types } from 'mongoose';
import Order, { IOrder, OrderStatus, PaymentStatus, PaymentMethod } from './order.model';
import Client from '../clients/client.model';
import Design from '../designs/design.model';
import { CreateOrderDto, UpdateOrderDto, AddPaymentDto, QueryOrderDto, OrderResponseDTO } from './dto';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import eventEmitter, { AppEvent } from '../../core/utils/eventEmitter';

export class OrderService {
  /**
   * Récupère toutes les commandes
   */
  async findAll(userId: string, query: QueryOrderDto): Promise<{
    orders: OrderResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, clientId, status, paymentStatus, assignedTo, dateFrom, dateTo } = query;
      const skip = (page - 1) * limit;

      // Construction du filtre
      const filter: any = { user: new Types.ObjectId(userId) };
      
      if (clientId) {
        filter.client = new Types.ObjectId(clientId);
      }

      if (status) {
        filter.status = status;
      }

      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }

      if (assignedTo) {
        filter.assignedTo = new Types.ObjectId(assignedTo);
      }

      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = dateFrom;
        if (dateTo) filter.createdAt.$lte = dateTo;
      }
      
      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      // Construction du tri
      let sort: any = {};
      if (sortBy === 'client') {
        // Tri complexe à gérer avec populate, on utilise un tri simple par défaut
        sort = { createdAt: -1 };
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Exécution des requêtes avec population
      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('client', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName email')
          .populate('assignedTo', 'firstName lastName email')
          .populate('items.design', 'title')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        orders: orders.map(order => new OrderResponseDTO(order)),
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      logger.error('Erreur dans findAll orders:', error);
      throw new AppError('Erreur lors de la récupération des commandes', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Récupère une commande par son ID
   */
  async findById(id: string, userId: string): Promise<OrderResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de commande invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const order = await Order.findOne({ 
        _id: id, 
        user: new Types.ObjectId(userId) 
      })
        .populate('client', 'firstName lastName email phone')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('items.design', 'title description')
        .lean();

      if (!order) {
        throw new AppError('Commande non trouvée', HTTP_STATUS.NOT_FOUND);
      }

      return new OrderResponseDTO(order);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans findById order:', error);
      throw new AppError('Erreur lors de la récupération de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Crée une nouvelle commande
   */
  async create(userId: string, data: CreateOrderDto, createdBy: string): Promise<OrderResponseDTO> {
    try {
      // Vérifier si le client existe
      const client = await Client.findOne({
        _id: data.clientId,
        user: new Types.ObjectId(userId)
      });

      if (!client) {
        throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      // Vérifier les designs (si fournis)
      if (data.items.some(item => item.designId)) {
        for (const item of data.items) {
          if (item.designId) {
            const design = await Design.findOne({
              _id: item.designId,
              user: new Types.ObjectId(userId)
            });

            if (!design) {
              throw new AppError(`Design avec ID ${item.designId} non trouvé`, HTTP_STATUS.NOT_FOUND);
            }
          }
        }
      }

      // Calculer les totaux
      const items = data.items.map(item => {
        const total = item.quantity * item.unitPrice;
        return {
          ...item,
          design: item.designId ? new Types.ObjectId(item.designId) : undefined,
          total
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = data.tax || 0;
      const discount = data.discount || 0;
      const total = subtotal + tax - discount;

      // Créer la commande
      const order = await Order.create({
        ...data,
        user: new Types.ObjectId(userId),
        client: new Types.ObjectId(data.clientId),
        items,
        subtotal,
        tax,
        discount,
        total,
        createdBy: new Types.ObjectId(createdBy),
        assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined,
        paymentStatus: PaymentStatus.PENDING
      });

      logger.info(`Nouvelle commande créée: ${order.orderNumber} par utilisateur ${userId}`);

      // Émettre l'événement de création
      eventEmitter.emit(AppEvent.ORDER_CREATED, {
        orderId: order._id.toString(),
        clientId: data.clientId,
        userId
      });

      // Récupérer avec les populations
      const populatedOrder = await Order.findById(order._id)
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('items.design', 'title')
        .lean();

      return new OrderResponseDTO(populatedOrder);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans create order:', error);
      throw new AppError('Erreur lors de la création de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Met à jour une commande
   */
  async update(id: string, userId: string, data: UpdateOrderDto): Promise<OrderResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de commande invalide', HTTP_STATUS.BAD_REQUEST);
      }

      // Vérifier si le client existe (si fourni)
      if (data.clientId) {
        const client = await Client.findOne({
          _id: data.clientId,
          user: new Types.ObjectId(userId)
        });

        if (!client) {
          throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
        }
      }

      // Vérifier les designs (si fournis)
      if (data.items && data.items.some(item => item.designId)) {
        for (const item of data.items) {
          if (item.designId) {
            const design = await Design.findOne({
              _id: item.designId,
              user: new Types.ObjectId(userId)
            });

            if (!design) {
              throw new AppError(`Design avec ID ${item.designId} non trouvé`, HTTP_STATUS.NOT_FOUND);
            }
          }
        }
      }

      // Préparer les données de mise à jour
      const updateData: any = { ...data };

      // Recalculer les totaux si les items sont modifiés
      if (data.items) {
        const items = data.items.map(item => {
          const total = item.quantity * item.unitPrice;
          return {
            ...item,
            design: item.designId ? new Types.ObjectId(item.designId) : undefined,
            total
          };
        });

        const order = await Order.findOne({ _id: id, user: userId });
        if (order) {
          const subtotal = items.reduce((sum, item) => sum + item.total, 0);
          const tax = data.tax !== undefined ? data.tax : order.price?.tax || 0;
          const discount = data.discount !== undefined ? data.discount : order.price?.discount?.value || 0;
          const total = subtotal + tax - discount;

          updateData.items = items;
          updateData.subtotal = subtotal;
          updateData.total = total;
          updateData.price = {
            ...order.price,
            subtotal,
            tax,
            total,
            discount: order.price?.discount ? { ...order.price.discount, value: discount } : undefined
          };
        }
      }

      // Mettre à jour le statut et les dates
      if (data.status === OrderStatus.DELIVERED && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }

      if (data.status === OrderStatus.CANCELLED && !updateData.cancelledAt) {
        updateData.cancelledAt = new Date();
      }

      // Mettre à jour la commande
      const order = await Order.findOneAndUpdate(
        { _id: id, user: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('items.design', 'title')
        .lean();

      if (!order) {
        throw new AppError('Commande non trouvée', HTTP_STATUS.NOT_FOUND);
      }

      logger.info(`Commande mise à jour: ${order.orderNumber}`);

      // Émettre l'événement de mise à jour
      eventEmitter.emit(AppEvent.ORDER_UPDATED, {
        orderId: id,
        changes: data
      });

      // Émettre l'événement de changement de statut si nécessaire
      const previousOrder = await Order.findOne({ _id: id, user: userId });
      if (data.status && previousOrder?.status !== data.status) {
        eventEmitter.emit(AppEvent.ORDER_STATUS_CHANGED, {
          orderId: id,
          oldStatus: previousOrder?.status || OrderStatus.PENDING,
          newStatus: data.status
        });
      }

      return new OrderResponseDTO(order);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans update order:', error);
      throw new AppError('Erreur lors de la mise à jour de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Ajoute un paiement à une commande
   */
  async addPayment(id: string, userId: string, data: AddPaymentDto): Promise<OrderResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de commande invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const order = await Order.findOne({ _id: id, user: userId });
      if (!order) {
        throw new AppError('Commande non trouvée', HTTP_STATUS.NOT_FOUND);
      }

      // Ajouter le paiement
      if (!order.payment) {
        order.payment = {
          status: PaymentStatus.PENDING,
          transactions: []
        } as any;
      }

      order.payment.transactions.push({
        amount: data.amount,
        method: data.method as PaymentMethod,
        reference: data.transactionId || undefined,
        date: new Date()
      });

      // Calculer le total payé
      const totalPaid = order.payment.transactions.reduce((sum, p) => sum + p.amount, 0);

      // Mettre à jour le statut de paiement
      if (totalPaid >= order.price?.total) {
        order.payment.status = PaymentStatus.PAID;
      } else if (totalPaid > 0) {
        order.payment.status = PaymentStatus.PARTIAL;
      }

      await order.save();

      logger.info(`Paiement ajouté à la commande ${order.orderNumber}`);

      // Récupérer avec les populations
      const populatedOrder = await Order.findById(order._id)
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('items.design', 'title')
        .lean();

      return new OrderResponseDTO(populatedOrder);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans addPayment order:', error);
      throw new AppError('Erreur lors de l\'ajout du paiement', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Supprime une commande
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de commande invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await Order.deleteOne({ 
        _id: id, 
        user: new Types.ObjectId(userId) 
      });

      if (result.deletedCount === 0) {
        throw new AppError('Commande non trouvée', HTTP_STATUS.NOT_FOUND);
      }

      logger.info(`Commande supprimée: ${id}`);

      // Émettre l'événement de suppression
      eventEmitter.emit(AppEvent.ORDER_DELETED, {
        orderId: id
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans delete order:', error);
      throw new AppError('Erreur lors de la suppression de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Récupère les statistiques des commandes
   */
  async getStats(userId: string): Promise<{
    total: number;
    totalRevenue: number;
    averageOrderValue: number;
    byStatus: Record<string, number>;
    recent: number;
    pending: number;
  }> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [stats, byStatus] = await Promise.all([
        Order.aggregate([
          { $match: { user: userObjectId } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalRevenue: { $sum: '$total' },
              avgOrderValue: { $avg: '$total' }
            }
          }
        ]),
        Order.aggregate([
          { $match: { user: userObjectId } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Order.countDocuments({
          user: userObjectId,
          createdAt: { $gte: thirtyDaysAgo }
        }),
        Order.countDocuments({
          user: userObjectId,
          status: OrderStatus.PENDING
        })
      ]);

      const statusStats: Record<string, number> = {};
      byStatus.forEach((item: any) => {
        statusStats[item._id] = item.count;
      });

      const result = stats[0] || { total: 0, totalRevenue: 0, avgOrderValue: 0 };

      return {
        total: result.total,
        totalRevenue: result.totalRevenue,
        averageOrderValue: result.avgOrderValue,
        byStatus: statusStats,
        recent: await Order.countDocuments({
          user: userObjectId,
          createdAt: { $gte: thirtyDaysAgo }
        }),
        pending: await Order.countDocuments({
          user: userObjectId,
          status: OrderStatus.PENDING
        })
      };
    } catch (error) {
      logger.error('Erreur dans getStats orders:', error);
      throw new AppError('Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}