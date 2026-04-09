// frontend/src/api/settingsApi.ts

import api from './client';

export interface EmailTemplate {
  _id: string;
  key: string;
  name: string;
  type: 'transactional' | 'marketing' | 'system';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  _id: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  siteTitle: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  supportPhoneNumber?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  // ========== EMAIL TEMPLATES ==========

  /**
   * Get all email templates
   */
  getAllTemplates: () =>
    api.get<{ success: boolean; data: EmailTemplate[]; count: number }>('/settings/templates'),

  /**
   * Get email template by key or ID
   */
  getTemplate: (keyOrId: string) =>
    api.get<{ success: boolean; data: EmailTemplate }>(`/settings/templates/${keyOrId}`),

  /**
   * Create email template
   */
  createTemplate: (data: Omit<EmailTemplate, '_id' | 'createdAt' | 'updatedAt' | 'version'>) =>
    api.post<{ success: boolean; message: string; data: EmailTemplate }>('/settings/templates', data),

  /**
   * Update email template
   */
  updateTemplate: (keyOrId: string, data: Partial<EmailTemplate>) =>
    api.put<{ success: boolean; message: string; data: EmailTemplate }>(
      `/settings/templates/${keyOrId}`,
      data
    ),

  /**
   * Delete email template
   */
  deleteTemplate: (keyOrId: string) =>
    api.delete<{ success: boolean; message: string }>(`/settings/templates/${keyOrId}`),

  /**
   * Toggle template active status
   */
  toggleTemplateStatus: (keyOrId: string) =>
    api.patch<{ success: boolean; message: string; data: { isActive: boolean } }>(
      `/settings/templates/${keyOrId}/toggle`
    ),

  /**
   * Get template statistics
   */
  getTemplateStats: () =>
    api.get<{ success: boolean; data: { total: number; active: number; byType: Record<string, number> } }>(
      '/settings/templates/stats'
    ),

  // ========== SYSTEM SETTINGS ==========

  /**
   * Get system settings (public route)
   */
  getSystemSettings: () =>
    api.get<{ success: boolean; data: SystemSettings }>('/settings/system'),

  /**
   * Update system settings (admin only)
   */
  updateSystemSettings: (data: Partial<SystemSettings>) =>
    api.put<{ success: boolean; message: string; data: SystemSettings }>('/settings/system', data)
};
