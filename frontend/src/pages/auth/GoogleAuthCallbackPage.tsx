import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

type GoogleCallbackPayload = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name?: string;
    role: string;
    phone?: string;
    avatar?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
  error?: string;
};

const decodeBase64UrlJson = (value: string): GoogleCallbackPayload => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as GoogleCallbackPayload;
};

export default function GoogleAuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuthData } = useAuthStore();
  const [message, setMessage] = useState("Finalisation de la connexion Google...");
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;

    const run = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const payloadParam = params.get("payload");

        if (!payloadParam) {
          throw new Error("Réponse Google introuvable");
        }

        const payload = decodeBase64UrlJson(payloadParam);
        if (payload.error) {
          throw new Error(payload.error);
        }

        localStorage.setItem("token", payload.accessToken);
        localStorage.setItem("accessToken", payload.accessToken);
        localStorage.setItem("refreshToken", payload.refreshToken);
        localStorage.setItem("user", JSON.stringify(payload.user));

        setAuthData(payload.user, payload.accessToken, payload.refreshToken);
        window.history.replaceState(null, "", "/auth/google/callback");

        setMessage("Connexion réussie, redirection...");
        const target =
          payload.user.role === "SUPER_ADMIN" || payload.user.role === "ADMIN"
            ? "/admin/dashboard"
            : "/user/profile";

        setTimeout(() => {
          navigate(target, { replace: true });
        }, 250);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Connexion Google impossible";
        setMessage(errorMessage);
        window.history.replaceState(null, "", "/auth/login");
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 1500);
      }
    };

    run();
  }, [navigate, setAuthData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Connexion Google</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
