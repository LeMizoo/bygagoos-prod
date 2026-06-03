import { Router } from 'express';
import { stockController } from './stock.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']));

router.get('/', (req, res) => stockController.getStockItems(req, res));
router.get('/stats', (req, res) => stockController.getStockStats(req, res));
router.get('/restock-suggestions', (req, res) => stockController.getRestockSuggestions(req, res));
router.get('/movements', (req, res) => stockController.getMovements(req, res));
router.get('/:id', (req, res) => stockController.getStockItemById(req, res));
router.post('/', (req, res) => stockController.createStockItem(req, res));
router.post('/movements', (req, res) => stockController.createMovement(req, res));
router.put('/:id', (req, res) => stockController.updateStockItem(req, res));
router.delete('/:id', (req, res) => stockController.deleteStockItem(req, res));

export default router;