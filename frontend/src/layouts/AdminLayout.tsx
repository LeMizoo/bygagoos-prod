// frontend/src/layouts/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}