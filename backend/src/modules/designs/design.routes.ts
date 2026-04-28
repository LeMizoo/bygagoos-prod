import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { uploadMultiple, handleMulterError } from '../../middlewares/upload.middleware';
import {
  getDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  deleteDesign,
  addDesignFiles,
  removeDesignFile,
} from './design.controller';

const router = Router();

router.use(protect);

router.get('/', getDesigns);
router.get('/:id', getDesignById);
router.post('/', createDesign);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);

router.post('/:id/files', uploadMultiple, handleMulterError, addDesignFiles);
router.delete('/:id/files/:fileId', removeDesignFile);

export default router;