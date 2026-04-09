// backend/src/modules/settings/settings.service.ts

import { EmailTemplate, IEmailTemplate, SystemSettings, ISystemSettings } from './settings.model';
import { Types } from 'mongoose';

export class SettingsService {
  /**
   * Get all email templates
   */
  static async getAllEmailTemplates(): Promise<any[]> {
    return EmailTemplate.find().sort({ createdAt: -1 }).lean() as any;
  }

  /**
   * Get email template by key or ID
   */
  static async getEmailTemplate(keyOrId: string): Promise<any | null> {
    // Try to find by key first
    let template = await EmailTemplate.findOne({ key: keyOrId }).lean() as any;
    
    // If not found and looks like an ObjectId, try finding by ID
    if (!template && Types.ObjectId.isValid(keyOrId)) {
      template = await EmailTemplate.findById(keyOrId).lean() as any;
    }
    
    return template;
  }

  /**
   * Create email template
   */
  static async createEmailTemplate(
    data: Partial<IEmailTemplate> & { key: string; name: string; subject: string; body: string },
    updatedBy?: string
  ): Promise<IEmailTemplate> {
    const template = new EmailTemplate({
      ...data,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined
    });
    return template.save();
  }

  /**
   * Update email template
   */
  static async updateEmailTemplate(
    keyOrId: string,
    data: Partial<IEmailTemplate>,
    updatedBy?: string
  ): Promise<IEmailTemplate | null> {
    const updateData = {
      ...data,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined
    };

    // Increment version for tracking changes
    let template = await EmailTemplate.findOne({ key: keyOrId });
    if (!template && Types.ObjectId.isValid(keyOrId)) {
      template = await EmailTemplate.findById(keyOrId);
    }

    if (template) {
      updateData.version = (template.version || 0) + 1;
    }

    // Try updating by key first
    let result = await EmailTemplate.findOneAndUpdate(
      { key: keyOrId },
      updateData,
      { new: true }
    );

    // If not found and looks like ObjectId, try by ID
    if (!result && Types.ObjectId.isValid(keyOrId)) {
      result = await EmailTemplate.findByIdAndUpdate(
        keyOrId,
        updateData,
        { new: true }
      );
    }

    return result;
  }

  /**
   * Delete email template
   */
  static async deleteEmailTemplate(keyOrId: string): Promise<boolean> {
    // Try by key first
    let result = await EmailTemplate.findOneAndDelete({ key: keyOrId });

    // If not found and looks like ObjectId, try by ID
    if (!result && Types.ObjectId.isValid(keyOrId)) {
      result = await EmailTemplate.findByIdAndDelete(keyOrId);
    }

    return !!result;
  }

  /**
   * Get system settings
   */
  static async getSystemSettings(): Promise<any | null> {
    return SystemSettings.findOne().lean() as any;
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(
    data: Partial<ISystemSettings>,
    updatedBy?: string
  ): Promise<ISystemSettings | null> {
    const updateData = {
      ...data,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined
    };

    // Upsert: create if doesn't exist, update if exists
    return SystemSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true }
    );
  }

  /**
   * Toggle template active status
   */
  static async toggleTemplateStatus(keyOrId: string): Promise<IEmailTemplate | null> {
    let template = await EmailTemplate.findOne({ key: keyOrId });
    if (!template && Types.ObjectId.isValid(keyOrId)) {
      template = await EmailTemplate.findById(keyOrId);
    }

    if (!template) return null;

    template.isActive = !template.isActive;
    return template.save();
  }

  /**
   * Get template statistics
   */
  static async getTemplateStats(): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
  }> {
    const templates = await EmailTemplate.find().lean();
    
    return {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      byType: {
        transactional: templates.filter(t => t.type === 'transactional').length,
        marketing: templates.filter(t => t.type === 'marketing').length,
        system: templates.filter(t => t.type === 'system').length
      }
    };
  }
}
