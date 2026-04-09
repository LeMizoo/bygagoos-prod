// backend/src/modules/settings/settings.routes.ts

import { Router } from 'express';
import * as settingsController from './settings.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

/**
 * ROUTES PUBLIQUES
 */
// Get system settings (public, for frontend)
router.get('/system', settingsController.getSystemSettings);

/**
 * ROUTES PROTÉGÉES (Admin only)
 */
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN']));

// ========== TEMPLATES ==========
// Get all templates
router.get('/templates', settingsController.getAllEmailTemplates);

// Get template stats
router.get('/templates/stats', settingsController.getTemplateStats);

// Get specific template
router.get('/templates/:keyOrId', settingsController.getEmailTemplate);

// Create new template
router.post('/templates', settingsController.createEmailTemplate);

// Update template
router.put('/templates/:keyOrId', settingsController.updateEmailTemplate);

// Delete template
router.delete('/templates/:keyOrId', settingsController.deleteEmailTemplate);

// Toggle template active status
router.patch('/templates/:keyOrId/toggle', settingsController.toggleTemplateStatus);

// ========== SYSTEM SETTINGS ==========
// Update system settings
router.put('/system', settingsController.updateSystemSettings);

export default router;
