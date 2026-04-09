// backend/src/modules/settings/settings.controller.ts

import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import logger from '../../core/utils/logger';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { AuthRequest } from '../../middlewares/auth.middleware';

/**
 * Get all email templates
 */
export const getAllEmailTemplates = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await SettingsService.getAllEmailTemplates();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    logger.error('Error fetching email templates:', error);
    next(error);
  }
};

/**
 * Get email template by key/ID
 */
export const getEmailTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keyOrId } = req.params;
    const template = await SettingsService.getEmailTemplate(keyOrId);
    
    if (!template) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Error fetching email template:', error);
    next(error);
  }
};

/**
 * Create email template
 */
export const createEmailTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key, name, subject, body, type, variables } = req.body;

    if (!key || !name || !subject || !body) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: key, name, subject, body'
      });
      return;
    }

    const template = await SettingsService.createEmailTemplate(
      {
        key,
        name,
        subject,
        body,
        type: type || 'transactional',
        variables: variables || []
      },
      req.user?.id
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Email template created successfully',
      data: template
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Template key already exists'
      });
      return;
    }
    logger.error('Error creating email template:', error);
    next(error);
  }
};

/**
 * Update email template
 */
export const updateEmailTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keyOrId } = req.params;
    const updateData = req.body;

    const template = await SettingsService.updateEmailTemplate(
      keyOrId,
      updateData,
      req.user?.id
    );

    if (!template) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email template updated successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error updating email template:', error);
    next(error);
  }
};

/**
 * Delete email template
 */
export const deleteEmailTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keyOrId } = req.params;
    const deleted = await SettingsService.deleteEmailTemplate(keyOrId);

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting email template:', error);
    next(error);
  }
};

/**
 * Toggle template active status
 */
export const toggleTemplateStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keyOrId } = req.params;
    const template = await SettingsService.toggleTemplateStatus(keyOrId);

    if (!template) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: template.isActive }
    });
  } catch (error) {
    logger.error('Error toggling template status:', error);
    next(error);
  }
};

/**
 * Get template statistics
 */
export const getTemplateStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await SettingsService.getTemplateStats();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching template stats:', error);
    next(error);
  }
};

/**
 * Get system settings
 */
export const getSystemSettings = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await SettingsService.getSystemSettings();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error fetching system settings:', error);
    next(error);
  }
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await SettingsService.updateSystemSettings(
      req.body,
      req.user?.id
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'System settings updated successfully',
      data: settings
    });
  } catch (error) {
    logger.error('Error updating system settings:', error);
    next(error);
  }
};
