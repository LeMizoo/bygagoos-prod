// frontend/src/pages/legal/ReturnsPage.tsx
import LegalLayout from "./LegalLayout";

export default function ReturnsPage() {
  return (
    <LegalLayout title="Politique de Retours & Échanges">
      <div className="space-y-8">
        <div className="border-l-4 border-amber-500 bg-amber-50 p-6 rounded-r-xl">
          <h2 className="text-xl font-bold text-amber-800 mb-2">ByGagoos Ink - Produits Personnalisés</h2>
          <p className="text-sm text-amber-700">Une fois le Bon À Tirer (BAT) validé, aucune modification ou annulation n'est acceptée.</p>
        </div>
        
        <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded-r-xl">
          <h2 className="text-xl font-bold text-cyan-800 mb-2">ByGagoos Trans - Annulation de course</h2>
          <p className="text-sm text-cyan-700">Annulation gratuite jusqu'à 5 minutes avant le départ.</p>
        </div>
        
        <div className="border-l-4 border-amber-500 bg-amber-50 p-6 rounded-r-xl">
          <h2 className="text-xl font-bold text-amber-800 mb-2">ByGagoos CDA - Annulation de réservation</h2>
          <p className="text-sm text-amber-700">Annulation gratuite jusqu'à 2 heures avant l'horaire réservé.</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">Délais de Réclamation</h2>
          <p>Toute réclamation doit être effectuée dans un délai de 7 jours ouvrables après réception du produit ou service.</p>
        </section>
      </div>
    </LegalLayout>
  );
}