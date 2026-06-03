import { Request, Response } from 'express';
import mongoose, { ClientSession, Types } from 'mongoose';
import Order, { IOrder, OrderStatus } from './order.model';
import Client from '../clients/client.model';
import Design from '../designs/design.model';
import { EmailService } from '../../services/email.service';
import { generatePDF } from '../../services/pdf.service';
import { cache } from '../../services/cache.service';
import { notificationService } from '../notifications/notification.service';
import { AppError } from '../../core/utils/errors/AppError';
import { catchAsync } from '../../core/utils/catchAsync';
import { UserRole } from '../../core/types/userRoles';

type OrderDesignInput = {
  design: string;
  quantity?: unknown;
  modifications?: string | null;
  previewUrl?: string | null;
};

type DiscountInput = {
  type: 'percentage' | 'fixed';
  value: unknown;
  reason?: string | null;
} | null | undefined;

type AssignedToInput = {
  designer?: unknown;
  validator?: unknown;
  producer?: unknown;
};

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

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeDiscount = (discount: DiscountInput) => {
  if (!discount) {
    return undefined;
  }

  return {
    type: discount.type,
    value: toNumber(discount.value, 0),
    reason: discount.reason ?? undefined,
  };
};

const getDesignBasePrice = (designDoc: any): number => {
  const candidates = [
    designDoc?.price,
    designDoc?.basePrice,
    designDoc?.metadata?.basePrice,
    designDoc?.metadata?.price,
  ];

  for (const candidate of candidates) {
    const parsed = toNumber(candidate, NaN);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const buildOrderDesigns = async (
  items: OrderDesignInput[],
  session: ClientSession
): Promise<Array<{
  design: Types.ObjectId;
  quantity: number;
  price: number;
  modifications?: string;
  previewUrl?: string;
  status: 'pending';
}>> => {
  return Promise.all(
    items.map(async (item) => {
      if (!item?.design) {
        throw new AppError('Design invalide', 400);
      }

      if (!Types.ObjectId.isValid(item.design)) {
        throw new AppError(`Design ${item.design} invalide`, 400);
      }

      const designDoc = await Design.findById(item.design).session(session);
      if (!designDoc) {
        throw new AppError(`Design ${item.design} non trouve`, 404);
      }

      return {
        design: new Types.ObjectId(item.design),
        quantity: Math.max(1, toNumber(item.quantity, 1)),
        price: getDesignBasePrice(designDoc),
        modifications: item.modifications ?? undefined,
        previewUrl: item.previewUrl ?? undefined,
        status: 'pending' as const,
      };
    })
  );
};

const buildOrderQueryFilter = (query: Record<string, unknown>): Record<string, unknown> => {
  const andConditions: Record<string, unknown>[] = [{ isActive: true }];

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const clientId = typeof query.clientId === 'string' ? query.clientId.trim() : '';
  const status = typeof query.status === 'string' ? query.status.trim() : '';
  const paymentStatus = typeof query.paymentStatus === 'string' ? query.paymentStatus.trim() : '';
  const assignedTo = typeof query.assignedTo === 'string' ? query.assignedTo.trim() : '';
  const dateFrom = query.dateFrom instanceof Date ? query.dateFrom : (typeof query.dateFrom === 'string' && query.dateFrom ? new Date(query.dateFrom) : undefined);
  const dateTo = query.dateTo instanceof Date ? query.dateTo : (typeof query.dateTo === 'string' && query.dateTo ? new Date(query.dateTo) : undefined);

  if (clientId && Types.ObjectId.isValid(clientId)) {
    andConditions.push({ client: new Types.ObjectId(clientId) });
  }

  if (status) {
    andConditions.push({ status });
  }

  if (paymentStatus) {
    andConditions.push({ 'payment.status': paymentStatus });
  }

  if (assignedTo && Types.ObjectId.isValid(assignedTo)) {
    andConditions.push({
      $or: [
        { 'assignedTo.designer': new Types.ObjectId(assignedTo) },
        { 'assignedTo.validator': new Types.ObjectId(assignedTo) },
        { 'assignedTo.producer': new Types.ObjectId(assignedTo) },
      ],
    });
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.$gte = dateFrom;
    if (dateTo) createdAt.$lte = dateTo;
    andConditions.push({ createdAt });
  }

  if (search) {
    const escapedSearch = escapeRegExp(search);
    andConditions.push({
      $or: [
        { orderNumber: { $regex: escapedSearch, $options: 'i' } },
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(escapedSearch, 'i')] } },
      ],
    });
  }

  return andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
};

const buildOrderSort = (sortBy: unknown, sortOrder: unknown): Record<string, 1 | -1> => {
  const allowedSortFields = new Set(['orderNumber', 'title', 'priority', 'status', 'requestedDate', 'createdAt', 'updatedAt']);
  const requestedSort = typeof sortBy === 'string' ? sortBy : 'createdAt';
  const safeSortBy = requestedSort === 'client' ? 'createdAt' : allowedSortFields.has(requestedSort) ? requestedSort : 'createdAt';
  const safeSortOrder = typeof sortOrder === 'string' && sortOrder.toLowerCase() === 'asc' ? 1 : -1;

  return { [safeSortBy]: safeSortOrder };
};

const populateOrderQuery = (query: any) =>
  query
    .populate('client', 'firstName lastName company email')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .populate('designs.design', 'title type thumbnail');

const buildClientScopeFilter = (req: Request): Record<string, unknown> => {
  if (req.user?.role === UserRole.CLIENT && req.user._id) {
    return { user: new Types.ObjectId(req.user._id as string) };
  }

  return {};
};

const getClientIdFromBody = (body: Record<string, unknown>): string | undefined => {
  const client = typeof body.client === 'string' ? body.client.trim() : '';
  if (client) return client;

  const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';
  return clientId || undefined;
};

const ensureValidObjectId = (value: string, label: string): void => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(`${label} invalide`, 400);
  }
};

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = req.body as Record<string, unknown>;
    const clientId = getClientIdFromBody(body);

    if (!clientId) {
      throw new AppError("L'ID du client est requis", 400);
    }

    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('ID de client invalide', 400);
    }

    const clientExists = await Client.findOne({
      _id: clientId,
      ...buildClientScopeFilter(req),
    }).session(session);
    if (!clientExists) {
      throw new AppError('Client non trouve', 404);
    }

    const designs = Array.isArray(body.designs) ? body.designs : [];
    const designsWithPrices = await buildOrderDesigns(designs as OrderDesignInput[], session);

    const taxRate = toNumber(body.taxRate, 20);
    const order = new Order({
      ...body,
      client: new Types.ObjectId(clientId),
      designs: designsWithPrices,
      tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      price: {
        taxRate,
        discount: normalizeDiscount(body.discount as DiscountInput),
        currency: 'EUR',
      },
      user: req.user?._id,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    (order as IOrder).calculateTotals();

    await order.save({ session });
    await session.commitTransaction();
    await clearOrdersCache();

    EmailService.sendOrderCreated(order._id.toString()).catch((error) => {
      console.error('Email Error:', error);
    });

    notificationService.notifyRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER], {
      title: 'Nouvelle commande Ink',
      body: `${clientExists.firstName || clientExists.company || 'Client'} a créé la commande ${order.orderNumber}.`,
      url: `/admin/orders/${order._id.toString()}`,
      tag: `order-${order._id.toString()}`,
    }).catch((error) => {
      console.error('Push Notification Error:', error);
    });

    const populatedOrder = await populateOrderQuery(
      Order.findById(order._id).lean()
    );

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, toNumber(req.query.page, 1));
  const limit = Math.min(Math.max(toNumber(req.query.limit, 20), 1), 100);
  const sortBy = req.query.sortBy;
  const sortOrder = req.query.sortOrder;
  const cacheKey = `orders:page:${page}:${JSON.stringify(req.query)}:${req.user?._id}`;

  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return res.json({ success: true, data: cachedData, fromCache: true });
  }

  const filter = buildOrderQueryFilter({
    search: req.query.search,
    clientId: req.query.clientId,
    status: req.query.status,
    paymentStatus: req.query.paymentStatus,
    assignedTo: req.query.assignedTo,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  });

  const skip = (page - 1) * limit;
  const sort = buildOrderSort(sortBy, sortOrder);

  const [orders, total] = await Promise.all([
    populateOrderQuery(
      Order.find(filter)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
    ).lean(),
    Order.countDocuments(filter),
  ]);

  const result = {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };

  await cache.set(cacheKey, result, 300);
  res.json({ success: true, data: result });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const scopeFilter = buildClientScopeFilter(req);
  const order = await populateOrderQuery(
    Order.findOne({
      _id: req.params.id,
      ...scopeFilter,
    })
  ).lean();

  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  res.json({ success: true, data: order });
});

export const updateOrder = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      throw new AppError('Commande non trouvee', 404);
    }

    const body = req.body as Record<string, unknown>;
    const clientId = getClientIdFromBody(body);

    if (clientId) {
      if (!Types.ObjectId.isValid(clientId)) {
        throw new AppError('ID de client invalide', 400);
      }

      const clientExists = await Client.findOne({
        _id: clientId,
        ...buildClientScopeFilter(req),
      }).session(session);
      if (!clientExists) {
        throw new AppError('Client non trouve', 404);
      }

      order.client = new Types.ObjectId(clientId);
    }

    if (typeof body.title === 'string') order.title = body.title;
    if (typeof body.description === 'string' || body.description === null) order.description = body.description as string | null;
    if (typeof body.priority === 'string') order.priority = body.priority as IOrder['priority'];
    if (body.requestedDate) order.requestedDate = new Date(body.requestedDate as string);
    if (Array.isArray(body.tags)) order.tags = body.tags.filter((tag): tag is string => typeof tag === 'string');
    if (body.metadata && typeof body.metadata === 'object') order.metadata = body.metadata as Record<string, unknown>;

    if (typeof body.taxRate !== 'undefined') {
      order.price.taxRate = toNumber(body.taxRate, order.price.taxRate ?? 20);
    }

    if (typeof body.discount !== 'undefined') {
      order.price.discount = normalizeDiscount(body.discount as DiscountInput);
    }

    if (Array.isArray(body.designs)) {
      order.designs = (await buildOrderDesigns(body.designs as OrderDesignInput[], session)) as any;
    }

    order.updatedBy = req.user?._id as Types.ObjectId;
    order.calculateTotals();

    await order.save({ session });
    await session.commitTransaction();
    await clearOrdersCache();

    const populatedOrder = await populateOrderQuery(
      Order.findById(order._id).lean()
    );

    res.json({ success: true, data: populatedOrder });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  const orderDoc = order as IOrder;
  orderDoc.updatedBy = req.user?._id as Types.ObjectId;
  await orderDoc.updateStatus(req.body.status as OrderStatus, req.user?._id as string, req.body.comment);

  const populatedOrder = await populateOrderQuery(
    Order.findById(orderDoc._id).lean()
  );

  await clearOrdersCache();
  res.json({ success: true, data: populatedOrder });
});

export const assignOrder = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  const assignedToInput = req.body.assignedTo as unknown;
  const normalizedAssignedTo: AssignedToInput = Array.isArray(assignedToInput)
    ? {
        designer: assignedToInput[0],
        validator: assignedToInput[1],
        producer: assignedToInput[2],
      }
    : assignedToInput && typeof assignedToInput === 'object'
      ? (assignedToInput as AssignedToInput)
      : {};

  const designerId = typeof normalizedAssignedTo.designer === 'string' && Types.ObjectId.isValid(normalizedAssignedTo.designer)
    ? new Types.ObjectId(normalizedAssignedTo.designer)
    : order.assignedTo?.designer;
  const validatorId = typeof normalizedAssignedTo.validator === 'string' && Types.ObjectId.isValid(normalizedAssignedTo.validator)
    ? new Types.ObjectId(normalizedAssignedTo.validator)
    : order.assignedTo?.validator;
  const producerId = typeof normalizedAssignedTo.producer === 'string' && Types.ObjectId.isValid(normalizedAssignedTo.producer)
    ? new Types.ObjectId(normalizedAssignedTo.producer)
    : order.assignedTo?.producer;

  order.assignedTo = {
    designer: designerId,
    validator: validatorId,
    producer: producerId,
  } as IOrder['assignedTo'];
  order.updatedBy = req.user?._id as Types.ObjectId;
  await order.save();

  const populatedOrder = await populateOrderQuery(
    Order.findById(order._id).lean()
  );

  await clearOrdersCache();
  res.json({ success: true, data: populatedOrder });
});

export const addMessage = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findOne({
    _id: req.params.id,
    ...buildClientScopeFilter(req),
  });

  if (!order) {
    throw new AppError('Commande introuvable', 404);
  }

  const orderDoc = order as IOrder;
  orderDoc.updatedBy = req.user?._id as Types.ObjectId;
  await orderDoc.addMessage({
    user: new Types.ObjectId(req.user?._id as string),
    content: req.body.content,
    attachments: req.body.attachments || [],
  });

  await clearOrdersCache();
  res.json({ success: true, data: orderDoc.messages[orderDoc.messages.length - 1] });
});

export const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findOne({
    _id: req.params.id,
    ...buildClientScopeFilter(req),
  });

  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  const orderDoc = order as IOrder;
  orderDoc.updatedBy = req.user?._id as Types.ObjectId;
  orderDoc.messages.forEach((msg) => {
    if (msg.user.toString() !== req.user?._id?.toString()) {
      const alreadyRead = msg.readBy.some((r) => r.user.toString() === req.user?._id?.toString());
      if (!alreadyRead) {
        msg.readBy.push({ user: new Types.ObjectId(req.user?._id as string), readAt: new Date() });
      }
    }
  });

  await orderDoc.save();
  await clearOrdersCache();
  res.json({ success: true, message: 'Messages lus' });
});

export const getOrderStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await Order.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, data: stats });
});

export const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findOne({
    _id: req.params.id,
    ...buildClientScopeFilter(req),
  })
    .populate('client')
    .lean();

  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  const pdfBuffer = await generatePDF('invoice', { order });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id.toString()}.pdf`);
  res.send(pdfBuffer);
});

export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { isActive: false, status: OrderStatus.ARCHIVED, updatedBy: req.user?._id },
    { new: true }
  );

  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  await clearOrdersCache();
  res.json({ success: true, message: 'Commande archivee' });
});

export const getOrdersByClient = catchAsync(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  if (!Types.ObjectId.isValid(clientId)) {
    throw new AppError('ID client invalide', 400);
  }

  const filter: Record<string, unknown> = {
    client: new Types.ObjectId(clientId),
    isActive: true,
    ...buildClientScopeFilter(req),
  };

  const orders = await populateOrderQuery(
    Order.find(filter).sort({ createdAt: -1 })
  ).lean();

  res.json({ success: true, data: orders });
});

export const restoreOrder = catchAsync(async (req: Request, res: Response) => {
  ensureValidObjectId(req.params.id, 'ID de commande');
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { isActive: true, status: OrderStatus.PENDING, updatedBy: req.user?._id },
    { new: true }
  );

  if (!order) {
    throw new AppError('Commande non trouvee', 404);
  }

  await clearOrdersCache();
  res.json({ success: true, message: 'Commande restauree', data: order });
});
