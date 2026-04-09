// backend/src/modules/forms/form.routes.ts

import { Router } from 'express';
import * as formController from './form.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware'; 

const router = Router();

/**
 * ROUTES PUBLIQUES
 */
router.get('/:slug', formController.getFormBySlug);

/**
 * ROUTES PROTÉGÉES
 */
router.use(protect);

// Correction : On passe un tableau car authorize attend 1 argument (le tableau de rôles)
router.use(authorize(['ADMIN', 'SUPER_ADMIN'])); 

router.get('/', formController.getAllForms);
router.put('/:slug', formController.upsertFormConfig);

export default router;