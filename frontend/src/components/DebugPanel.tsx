import React from "react";
import { useAuthStore } from "../stores/authStore";
import { API_URL } from "../api";
import dev from "../utils/devLogger";

const DebugPanel: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore();

  const testApi = async () => {
    try {
      dev.log("🧪 Testing API...");

      // Test /auth/me
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      dev.log("✅ /auth/me:", {
        status: response.status,
        ok: response.ok,
        data: await response.json(),
      });
    } catch (error) {
      dev.error("❌ API test failed:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Debug Panel</h3>
      <div className="text-sm space-y-1">
        <p>Auth: {isAuthenticated ? "✅" : "❌"}</p>
        <p>Token: {token ? "Present" : "Missing"}</p>
        <p>User: {user?.email || "None"}</p>
        <p>Role: {user?.role || "None"}</p>
      </div>
      <button
        onClick={testApi}
        className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
      >
        Test API
      </button>
    </div>
  );
};

export default DebugPanel;
