import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { uploadMultiple, handleMulterError } from '../../middlewares/upload.middleware';
import { validate } from '../../core/middlewares/validate';
import { queryDesignSchema, createDesignSchema, updateDesignSchema } from './dto';
import {
  getDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  deleteDesign,
  addDesignFiles,
  removeDesignFile,
  getDesignStats,
  getPublicDesigns
} from './design.controller';

const router = Router();

// ========== ROUTES PUBLIQUES (sans authentification) ==========
// IMPORTANT : Aucun middleware d'authentification avant cette route
router.get('/public', getPublicDesigns);  // Validation retirée temporairement pour éviter erreur 400

// ========== ROUTES PROTÉGÉES (authentification requise) ==========
router.use(protect);

router.get('/stats', getDesignStats);
router.get('/', validate(queryDesignSchema, 'query'), getDesigns);
router.get('/:id', getDesignById);
router.post('/', validate(createDesignSchema, 'body'), createDesign);
router.put('/:id', validate(updateDesignSchema, 'body'), updateDesign);
router.delete('/:id', deleteDesign);

router.post('/:id/files', uploadMultiple, handleMulterError, addDesignFiles);
router.delete('/:id/files/:fileId', removeDesignFile);

export default router;