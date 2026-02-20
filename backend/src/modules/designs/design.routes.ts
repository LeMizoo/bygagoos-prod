import { Router } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware';
import { uploadMultiple, handleMulterError } from '../../middlewares/upload.middleware';
import { UserRole } from '../../core/types/userRoles';
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
  getDesignStats
} from './design.controller';

const router = Router();

// Toutes les routes designs nécessitent une authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/stats', getDesignStats);
router.get('/', validate(queryDesignSchema, 'query'), getDesigns);
router.get('/:id', getDesignById);
router.post('/', validate(createDesignSchema, 'body'), createDesign);
router.put('/:id', validate(updateDesignSchema, 'body'), updateDesign);
router.delete('/:id', deleteDesign);

// Routes pour les fichiers
router.post(
  '/:id/files',
  uploadMultiple,
  handleMulterError,
  addDesignFiles
);

router.delete('/:id/files/:fileId', removeDesignFile);

export default router;