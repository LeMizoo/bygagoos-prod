// frontend/src/pages/legal/ReturnsPage.tsx
import LegalLayout from "./LegalLayout";

export default function ReturnsPage() {
  return (
    <LegalLayout title="Politique de Retours & Échanges">
      <section>
        <h2 className="text-2xl font-semibold text-gray-800">1. Produits Personnalisés</h2>
        <p>
          Chez ByGagoos-Ink, nous créons des produits sur mesure. En raison de la nature personnalisée 
          de nos services de sérigraphie, les articles ne peuvent être retournés sauf en cas de défaut 
          de fabrication ou d'erreur de notre part.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">2. Délais de Réclamation</h2>
        <p>
          Toute réclamation concernant une commande doit être effectuée dans un délai de 7 jours 
          ouvrables après réception du produit.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">3. Procédure de Retour</h2>
        <p>
          Si vous constatez un défaut, veuillez nous contacter à <strong>positifaid@live.fr</strong> 
          avec des photos du produit défectueux. Après validation, nous procéderons à une réimpression 
          à nos frais.
        </p>
      </section>
    </LegalLayout>
  );
}