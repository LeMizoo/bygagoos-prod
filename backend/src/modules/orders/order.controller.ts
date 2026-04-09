import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Order, { OrderStatus, IOrder } from './order.model';
import Client from '../clients/client.model';
import Design from '../designs/design.model';
import { EmailService } from '../../services/email.service';
import { generatePDF } from '../../services/pdf.service';
import { cache } from '../../services/cache.service';
import { AppError } from '../../core/utils/errors/AppError'; 
import { catchAsync } from '../../core/utils/catchAsync';

/**
 * Nettoyage du cache lié aux commandes
 */
const clearOrdersCache = async (): Promise<void> => {
  try {
    if (cache && typeof cache.delByPattern === 'function') {
      await cache.delByPattern('orders:*');
    }
    await cache.del('orders:stats');
  } catch (error) {
    console.error('Erreur cache:', error);
  }
};

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { client, designs, ...orderData } = req.body;
    const clientExists = await Client.findById(client).session(session);
    if (!clientExists) throw new AppError('Client non trouvé', 404);

    const designsWithPrices = await Promise.all(
      designs.map(async (item: { design: string; quantity?: number }) => {
        const designDoc = await Design.findById(item.design).session(session);
        if (!designDoc) throw new AppError(`Design ${item.design} non trouvé`, 404);
        
        return {
          design: new Types.ObjectId(item.design),
          quantity: item.quantity || 1,
          price: (designDoc as any).price || 0,
          status: 'pending'
        };
      })
    );

    const order = new Order({
      ...orderData,
      user: req.user?._id,
      client: new Types.ObjectId(client as string),
      designs: designsWithPrices,
      createdBy: req.user?._id,
    });

    (order as IOrder).calculateTotals();
    
    await order.save({ session });
    await session.commitTransaction();
    await clearOrdersCache();
    
    EmailService.sendOrderCreated(order._id.toString()).catch(err => 
      console.error('Email Error:', err)
    );

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const cacheKey = `orders:page:${page}:${JSON.stringify(req.query)}:${req.user?._id}`;
  
  const cachedData = await cache.get(cacheKey);
  if (cachedData) return res.json({ success: true, data: cachedData, fromCache: true });

  const filter: Record<string, unknown> = { isActive: true };
  const skip = (Number(page) - 1) * Number(limit);
  const sort: Record<string, number> = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('client', 'firstName lastName company')
      .sort(sort as any)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(filter)
  ]);

  const result = { 
    orders, 
    pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } 
  };

  await cache.set(cacheKey, result, 300);
  res.json({ success: true, data: result });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('client designs.design').lean();
  if (!order) throw new AppError('Commande non trouvée', 404);
  res.json({ success: true, data: order });
});

export const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) throw new AppError('Commande non trouvée', 404);
  await clearOrdersCache();
  res.json({ success: true, data: order });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Commande non trouvée', 404);

  const orderDoc = order as IOrder;
  await orderDoc.updateStatus(req.body.status as OrderStatus, req.user?._id as string, req.body.comment);

  await clearOrdersCache();
  res.json({ success: true, data: orderDoc });
});

export const assignOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { assignedTo: req.body }, { new: true });
  if (!order) throw new AppError('Commande non trouvée', 404);
  res.json({ success: true, data: order });
});

export const addMessage = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Commande introuvable', 404);

  const orderDoc = order as IOrder;
  await orderDoc.addMessage({
    user: new Types.ObjectId(req.user?._id as string),
    content: req.body.content,
    attachments: req.body.attachments || []
  });
  
  res.json({ success: true, data: orderDoc.messages[orderDoc.messages.length - 1] });
});

export const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Commande non trouvée', 404);

  const orderDoc = order as IOrder;
  orderDoc.messages.forEach((msg) => {
    if (msg.user.toString() !== req.user?._id?.toString()) {
      const alreadyRead = msg.readBy.some(r => r.user.toString() === req.user?._id?.toString());
      if (!alreadyRead) {
        msg.readBy.push({ user: new Types.ObjectId(req.user?._id as string), readAt: new Date() });
      }
    }
  });

  await orderDoc.save();
  res.json({ success: true, message: 'Messages lus' });
});

export const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await Order.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  res.json({ success: true, data: stats });
});

export const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('client').lean();
  if (!order) throw new AppError('Commande non trouvée', 404);

  const pdfBuffer = await generatePDF('invoice', { order });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id.toString()}.pdf`);
  res.send(pdfBuffer);
});

export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id, 
    { isActive: false, status: OrderStatus.ARCHIVED },
    { new: true }
  );
  if (!order) throw new AppError('Commande non trouvée', 404);
  await clearOrdersCache();
  res.json({ success: true, message: 'Commande archivée' });
});

// --- NOUVELLES FONCTIONS AJOUTÉES POUR VOS ROUTES ---

export const getOrdersByClient = catchAsync(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const orders = await Order.find({ client: clientId, isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

export const restoreOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { isActive: true, status: OrderStatus.PENDING },
    { new: true }
  );
  if (!order) throw new AppError('Commande non trouvée', 404);
  await clearOrdersCache();
  res.json({ success: true, message: 'Commande restaurée', data: order });
});