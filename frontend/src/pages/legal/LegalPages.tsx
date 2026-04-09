// frontend/src/pages/legal/LegalPages.tsx
import LegalLayout from "./LegalLayout";

/**
 * POLITIQUE DE CONFIDENTIALITÉ
 * Focus : RGPD et protection des données clients (MVola, adresses)
 */
export const PrivacyPage = () => (
  <LegalLayout title="Politique de Confidentialité">
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 text-sm text-blue-800">
        Dernière mise à jour : Mars 2026. Cette politique décrit comment ByGagoos-Ink traite vos données conformément aux normes de protection de la vie privée.
      </div>
      
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">1. Collecte des données</h2>
        <p>Nous collectons les informations nécessaires au traitement de vos commandes et à la facturation :</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Identité :</strong> Nom, prénom, dénomination sociale.</li>
          <li><strong>Contact :</strong> Adresse email, numéro de téléphone (pour suivi livraison/paiement).</li>
          <li><strong>Livraison :</strong> Adresse physique précise pour les livraisons à Antananarivo et en province.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">2. Sécurité des Paiements</h2>
        <p>ByGagoos-Ink n'enregistre jamais vos coordonnées bancaires. Les transactions effectuées via <strong>MVola</strong> ou virements sont sécurisées par les protocoles de nos partenaires financiers respectifs.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">3. Vos Droits</h2>
        <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour toute demande, contactez notre responsable technique à <strong>positifaid@live.fr</strong>.</p>
      </section>
    </div>
  </LegalLayout>
);

/**
 * CONDITIONS D'UTILISATION
 * Focus : Propriété intellectuelle et conditions de vente
 */
export const TermsPage = () => (
  <LegalLayout title="Conditions d'Utilisation">
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">1. Objet des Services</h2>
        <p>ByGagoos-Ink fournit des prestations de marquage textile (sérigraphie), de design graphique et de solutions de packaging. Toute commande implique l'adhésion pleine et entière du client aux présentes CGU.</p>
      </section>

      <section className="bg-gray-50 p-6 rounded-xl border">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>⚖️</span> Propriété Intellectuelle
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Le client déclare détenir tous les droits de propriété intellectuelle sur les logos, images et textes fournis pour impression. ByGagoos-Ink décline toute responsabilité en cas de litige relatif aux droits d'auteur. Nous nous réservons le droit de refuser toute commande présentant un caractère offensant, illégal ou contrefait.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">2. Tolérances Techniques</h2>
        <p>En raison du processus artisanal de la sérigraphie traditionnelle :</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li><strong>Couleurs :</strong> Une variation de 5% à 10% par rapport au code Pantone peut être constatée selon la fibre du textile.</li>
          <li><strong>Placement :</strong> Une marge d'erreur de positionnement de 1 à 2 cm est tolérée par rapport au BAT.</li>
        </ul>
      </section>
    </div>
  </LegalLayout>
);

/**
 * POLITIQUE DES COOKIES
 */
export const CookiesPage = () => (
  <LegalLayout title="Gestion des Cookies">
    <div className="space-y-6">
      <p>Pour assurer le bon fonctionnement de <strong>bygagoos-ink.vercel.app</strong> et de nos interfaces de commande, nous utilisons des cookies techniques.</p>
      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Utilité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 font-medium">Session</td>
              <td className="px-6 py-4">Maintien de votre connexion à votre compte client.</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium">Préférences</td>
              <td className="px-6 py-4">Mémorisation de votre choix de thème (Sombre/Clair).</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </LegalLayout>
);

/**
 * RETOURS & ÉCHANGES
 * Focus : Protection contre les annulations abusives en personnalisé
 */
export const ReturnsPage = () => (
  <LegalLayout title="Retours & Échanges">
    <div className="space-y-8">
      <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-xl">
        <h2 className="text-xl font-bold text-red-800 mb-2">Produits Personnalisés</h2>
        <p className="text-sm text-red-700 leading-relaxed">
          Conformément au Code de la Consommation concernant les biens nettement personnalisés, le droit de rétractation ne peut être exercé. Une fois le <strong>Bon À Tirer (BAT)</strong> validé et la production lancée, aucune modification ou annulation ne sera acceptée.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Procédure de Réclamation</h2>
        <p>En cas de défaut majeur (erreur de visuel, textile troué, défaut d'encre) :</p>
        <ol className="list-decimal pl-6 mt-2 space-y-3">
          <li>Envoyez une photo claire du défaut à notre équipe sous <strong>7 jours</strong>.</li>
          <li>Après expertise, nous procéderons soit à une réimpression à nos frais, soit à l'émission d'un avoir commercial.</li>
        </ol>
      </section>
    </div>
  </LegalLayout>
);

/**
 * CENTRE D'AIDE TECHNIQUE
 * Focus : Expertise textile (Coton, Poly, Nylon)
 */
export const HelpCenterPage = () => (
  <LegalLayout title="Centre d'Aide Technique">
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📐</span> Préparation des fichiers
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>• <strong>Vectorisation :</strong> Obligatoire pour les textes (.AI, .EPS).</li>
            <li>• <strong>Couleurs :</strong> Travaillez en mode <strong>CMJN</strong> pour éviter les mauvaises surprises au rendu.</li>
            <li>• <strong>Épaisseur :</strong> Évitez les traits inférieurs à 0.5pt pour une impression nette.</li>
          </ul>
        </div>

        <div className="bg-white p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👕</span> Choix du support
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Pour un rendu premium, privilégiez le <strong>100% Coton peigné</strong>. Sa maille serrée permet une finition lisse et une parfaite adhérence des encres.
          </p>
        </div>
      </div>

      <section className="bg-amber-50 border-l-4 border-amber-400 p-8 rounded-r-xl">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
          <span>🔬</span> Expertise Matières Synthétiques
        </h2>
        <div className="grid md:grid-cols-2 gap-8 text-sm text-amber-900/80">
          <div>
            <h3 className="font-bold text-amber-950 text-lg mb-2">Polyester (Sport)</h3>
            <p className="leading-relaxed">
              Le polyester est sensible à la <strong>migration de teinture</strong>. Nous utilisons des encres à basse température et des barrières anti-migration pour garantir que vos couleurs restent vives, sans "saignement" du tissu à travers l'encre.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-amber-950 text-lg mb-2">Nylon & Imperméabilisés</h3>
            <p className="leading-relaxed">
              Pour les K-way ou sacs, nous ajoutons un <strong>catalyseur</strong> à l'encre Plastisol. 
              <br /><br />
              <span className="font-bold">⚠️ Important :</span> Ces pièces nécessitent 24h de séchage naturel supplémentaire.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center py-6 border-t border-dashed">
        <p className="text-gray-500 italic text-sm">
          Un doute sur votre projet ? Appelez notre atelier au <strong>+261 34 43 359 30</strong>.
        </p>
      </section>
    </div>
  </LegalLayout>
);

/**
 * FAQ
 */
export const FAQPage = () => (
  <LegalLayout title="Foire Aux Questions">
    <div className="space-y-6">
      {[
        { q: "Quels sont les minimums ?", a: "Minimum de 10 pièces par visuel pour la sérigraphie." },
        { q: "Quels sont les délais ?", a: "7 à 10 jours ouvrés en moyenne après réception de l'acompte." },
        { q: "Modes de paiement ?", a: "Espèces à l'atelier, MVola ou Virement Bancaire." },
        { q: "Livraison ?", a: "Livraison gratuite à Tana (selon volume), expédition province via coopératives." }
      ].map((item, i) => (
        <div key={i} className="border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.q}</h3>
          <p className="text-gray-600">{item.a}</p>
        </div>
      ))}
    </div>
  </LegalLayout>
);

/**
 * CARRIÈRES
 */
export const CareersPage = () => (
  <LegalLayout title="Rejoindre l'équipe">
    <div className="space-y-6">
      <p className="text-lg text-gray-700">ByGagoos-Ink se développe ! Nous cherchons des profils passionnés par l'artisanat et la tech.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {['Design Graphique', 'Sérigraphe Expert', 'Logistique'].map(job => (
          <div key={job} className="p-4 border border-blue-200 rounded-lg text-center font-bold text-blue-700 bg-blue-50">
            {job}
          </div>
        ))}
      </div>
      <p className="text-center mt-10 p-4 border rounded-lg bg-gray-50">
        Envoyez votre candidature à : <br />
        <span className="text-xl font-bold text-blue-600">positifaid@live.fr</span>
      </p>
    </div>
  </LegalLayout>
);

/**
 * PRESSE
 */
export const PressPage = () => (
  <LegalLayout title="Espace Presse">
    <div className="space-y-6">
      <p>Retrouvez l'histoire de ByGagoos-Ink, de la sérigraphie traditionnelle au digital.</p>
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl text-white">
        <h3 className="text-xl font-bold mb-4">Télécharger notre Kit Média</h3>
        <p className="text-gray-400 text-sm mb-6">Contient nos logos officiels, photos d'atelier et charte graphique.</p>
        <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
          Télécharger (.ZIP)
        </button>
      </div>
    </div>
  </LegalLayout>
);