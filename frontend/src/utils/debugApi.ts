// frontend/src/utils/debugApi.ts
import { API_URL } from "../api";
import { dev } from './devLogger';

export const debugApi = async () => {
  dev.group("🔧 DEBUG API SYSTEM");

  // 1. Vérifier l'URL API
  dev.log("🌐 API_URL:", API_URL);

  // 2. Vérifier le token
  const token = localStorage.getItem("token");
  dev.log("🔑 Token in localStorage:", token ? "Present" : "Missing");

  if (token) {
    // 3. Tester l'endpoint /auth/me
    try {
      dev.log("🧪 Testing /auth/me...");
      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dev.log("📡 /auth/me status:", meResponse.status);
      if (meResponse.ok) {
        const meData = await meResponse.json();
        dev.log("✅ /auth/me data:", meData);
      }
    } catch (error) {
      dev.error("❌ /auth/me error:", error);
    }

    // 4. Tester l'endpoint /admin/staff
    try {
      dev.log("🧪 Testing /admin/staff...");
      const staffResponse = await fetch(`${API_URL}/api/admin/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dev.log("📡 /admin/staff status:", staffResponse.status);
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        dev.log("✅ /admin/staff data structure:", {
          success: staffData.success,
          hasData: !!staffData.data,
          isArray: Array.isArray(staffData.data),
          data: staffData,
        });
      }
    } catch (error) {
      dev.error("❌ /admin/staff error:", error);
    }
  }

  dev.groupEnd();
};

// Ajouter à la console globale pour le débogage (défini seulement en DEV via devLogger)
if (typeof window !== "undefined") {
  (window as any).debugApi = debugApi;
}
