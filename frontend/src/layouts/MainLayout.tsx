// frontend/src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div id="main-content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}