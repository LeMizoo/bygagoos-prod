// frontend/src/api/adminSettings.api.ts
import { apiFetch } from "./index";

export interface AppSettings {
  siteName?: string;
  language?: string;
  enableAnalytics?: boolean;
  enableMaintenance?: boolean;
  [key: string]: any;
}

export const adminSettingsApi = {
  // Routes SANS /api
  get: () => apiFetch<AppSettings>("/admin/settings"),
  update: (data: AppSettings) =>
    apiFetch<AppSettings>("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export default adminSettingsApi;
