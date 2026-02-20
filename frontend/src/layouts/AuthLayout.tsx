import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <img
            src="/images/logo.png"
            alt="ByGagoos Ink"
            className="h-16 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
}