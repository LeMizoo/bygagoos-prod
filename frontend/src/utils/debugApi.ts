// frontend/src/utils/debugApi.ts
import { API_URL } from "../api";

export const debugApi = async () => {
  console.group("🔧 DEBUG API SYSTEM");

  // 1. Vérifier l'URL API
  console.log("🌐 API_URL:", API_URL);

  // 2. Vérifier le token
  const token = localStorage.getItem("token");
  console.log("🔑 Token in localStorage:", token ? "Present" : "Missing");

  if (token) {
    // 3. Tester l'endpoint /auth/me
    try {
      console.log("🧪 Testing /auth/me...");
      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("📡 /auth/me status:", meResponse.status);
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log("✅ /auth/me data:", meData);
      }
    } catch (error) {
      console.error("❌ /auth/me error:", error);
    }

    // 4. Tester l'endpoint /admin/staff
    try {
      console.log("🧪 Testing /admin/staff...");
      const staffResponse = await fetch(`${API_URL}/api/admin/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("📡 /admin/staff status:", staffResponse.status);
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        console.log("✅ /admin/staff data structure:", {
          success: staffData.success,
          hasData: !!staffData.data,
          isArray: Array.isArray(staffData.data),
          data: staffData,
        });
      }
    } catch (error) {
      console.error("❌ /admin/staff error:", error);
    }
  }

  console.groupEnd();
};

// Ajouter à la console globale pour le débogage
if (typeof window !== "undefined") {
  (window as any).debugApi = debugApi;
}
