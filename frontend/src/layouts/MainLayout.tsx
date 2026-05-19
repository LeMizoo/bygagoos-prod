import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-blue-600 focus:p-2 focus:rounded"
      >
        Aller au contenu
      </a>
      <main className="flex-1">
        <div id="main-content">
          <Outlet />  {/* ← C'est parfait comme ça */}
        </div>
      </main>
      <Footer />
    </div>
  );
}