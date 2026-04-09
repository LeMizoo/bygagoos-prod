// frontend/src/pages/legal/LegalLayout.tsx
import { ReactNode, useEffect } from "react";

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LegalLayout({ title, children }: LegalLayoutProps) {
  // Remonte automatiquement en haut de page lors du chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b pb-6">
            {title}
          </h1>
          <div className="prose prose-blue max-w-none text-gray-600 space-y-6 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}