import { StockItem, StockMovement, IStockItem, StockMovementType, StockMovementReason } from './stock.model';
import logger from '../../core/utils/logger';

export class StockService {
  async getAllStockItems(filters?: { category?: string; alertLevel?: string }) {
    try {
      const query: any = { isActive: true };
      if (filters?.category) query.category = filters.category;
      if (filters?.alertLevel) query.alertLevel = filters.alertLevel;
      
      const items = await StockItem.find(query).sort({ createdAt: -1 });
      return { items, total: items.length };
    } catch (error) {
      logger.error('Error fetching stock items:', error);
      throw error;
    }
  }

  async getStockItemById(id: string) {
    try {
      const item = await StockItem.findById(id);
      if (!item) throw new Error('Stock item not found');
      return item;
    } catch (error) {
      logger.error('Error fetching stock item:', error);
      throw error;
    }
  }

  async createStockItem(data: Partial<IStockItem>, userId: string) {
    try {
      const item = new StockItem({ ...data, createdBy: userId });
      await item.save();
      return item;
    } catch (error) {
      logger.error('Error creating stock item:', error);
      throw error;
    }
  }

  async updateStockItem(id: string, data: Partial<IStockItem>) {
    try {
      const item = await StockItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!item) throw new Error('Stock item not found');
      return item;
    } catch (error) {
      logger.error('Error updating stock item:', error);
      throw error;
    }
  }

  async deleteStockItem(id: string) {
    try {
      const item = await StockItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!item) throw new Error('Stock item not found');
      return item;
    } catch (error) {
      logger.error('Error deleting stock item:', error);
      throw error;
    }
  }

  async createMovement(
    itemId: string,
    type: StockMovementType,
    quantity: number,
    reason: StockMovementReason,
    note: string | undefined,
    userId: string
  ) {
    try {
      const item = await StockItem.findById(itemId);
      if (!item) throw new Error('Stock item not found');

      const previousStock = item.quantity;
      const newStock = type === StockMovementType.IN ? previousStock + quantity : Math.max(0, previousStock - quantity);
      
      const movement = new StockMovement({
        itemId, type, quantity, previousStock, newStock, reason, note, createdBy: userId
      });
      await movement.save();

      item.quantity = newStock;
      await item.save();

      return movement;
    } catch (error) {
      logger.error('Error creating movement:', error);
      throw error;
    }
  }

  async getMovements(itemId?: string, limit = 50) {
    try {
      const query: any = {};
      if (itemId) query.itemId = itemId;
      const movements = await StockMovement.find(query)
        .populate('itemId', 'name unit')
        .sort({ createdAt: -1 })
        .limit(limit);
      return movements;
    } catch (error) {
      logger.error('Error fetching movements:', error);
      throw error;
    }
  }

  async getStockStats() {
    try {
      const totalItems = await StockItem.countDocuments({ isActive: true });
      const criticalStock = await StockItem.countDocuments({ alertLevel: 'CRITICAL', isActive: true });
      const lowStock = await StockItem.countDocuments({ alertLevel: 'LOW', isActive: true });
      const totalValue = 0; // À implémenter avec prix unitaire
      
      const mostConsumed = await StockMovement.aggregate([
        { $match: { type: 'OUT' } },
        { $group: { _id: '$itemId', consumed: { $sum: '$quantity' } } },
        { $sort: { consumed: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'stockitems', localField: '_id', foreignField: '_id', as: 'item' } },
        { $unwind: '$item' },
        { $project: { name: '$item.name', consumed: 1 } }
      ]);
      
      return { totalItems, criticalStock, lowStock, totalValue, mostConsumed };
    } catch (error) {
      logger.error('Error fetching stock stats:', error);
      throw error;
    }
  }

  async getRestockSuggestions() {
    try {
      const items = await StockItem.find({
        isActive: true,
        $expr: { $lte: ['$quantity', '$minThreshold'] }
      });
      return items;
    } catch (error) {
      logger.error('Error fetching restock suggestions:', error);
      throw error;
    }
  }
}