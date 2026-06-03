import { Request, Response } from 'express';
import { StockService } from './stock.service';
import { StockMovementType, StockMovementReason } from './stock.model';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';

const stockService = new StockService();

export class StockController {
  async getStockItems(req: Request, res: Response) {
    try {
      const { category, alertLevel } = req.query;
      const data = await stockService.getAllStockItems({ 
        category: category as string, 
        alertLevel: alertLevel as string 
      });
      res.json(data);
    } catch (error) {
      logger.error('Error in getStockItems:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch stock items' });
    }
  }

  async getStockItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await stockService.getStockItemById(id);
      res.json(item);
    } catch (error) {
      logger.error('Error in getStockItemById:', error);
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Stock item not found' });
    }
  }

  async createStockItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const item = await stockService.createStockItem(req.body, userId);
      res.status(HTTP_STATUS.CREATED).json(item);
    } catch (error) {
      logger.error('Error in createStockItem:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create stock item' });
    }
  }

  async updateStockItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await stockService.updateStockItem(id, req.body);
      res.json(item);
    } catch (error) {
      logger.error('Error in updateStockItem:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update stock item' });
    }
  }

  async deleteStockItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await stockService.deleteStockItem(id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error in deleteStockItem:', error);
      if ((error as Error).message === 'Stock item not found') {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Stock item not found' });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete stock item' });
      }
    }
  }

  async createMovement(req: Request, res: Response) {
    try {
      const { itemId, type, quantity, reason, note } = req.body;
      const userId = (req as any).user?.id;
      
      if (!itemId || !type || !quantity || !reason) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing required fields' });
      }
      
      const movement = await stockService.createMovement(
        itemId, 
        type as StockMovementType, 
        quantity, 
        reason as StockMovementReason, 
        note, 
        userId
      );
      res.status(HTTP_STATUS.CREATED).json(movement);
    } catch (error) {
      logger.error('Error in createMovement:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create movement' });
    }
  }

  async getMovements(req: Request, res: Response) {
    try {
      const { itemId, limit = 50 } = req.query;
      const movements = await stockService.getMovements(itemId as string, Number(limit));
      res.json(movements);
    } catch (error) {
      logger.error('Error in getMovements:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch movements' });
    }
  }

  async getStockStats(req: Request, res: Response) {
    try {
      const stats = await stockService.getStockStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error in getStockStats:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch stock statistics' });
    }
  }

  async getRestockSuggestions(req: Request, res: Response) {
    try {
      const suggestions = await stockService.getRestockSuggestions();
      res.json(suggestions);
    } catch (error) {
      logger.error('Error in getRestockSuggestions:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch restock suggestions' });
    }
  }
}

export const stockController = new StockController();