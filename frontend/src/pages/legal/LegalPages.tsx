// frontend/src/pages/legal/LegalPages.tsx
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Heart, Cross, Church, Bike, UtensilsCrossed, Palette } from "lucide-react";
import LegalLayout from "./LegalLayout";

export const PrivacyPage = () => (
  <LegalLayout title="Politique de Confidentialité">
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 text-sm text-blue-800">
        Dernière mise à jour : Mai 2026. Cette politique s'applique à l'ensemble des activités ByGagoos Prod.
      </div>
      
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">1. Collecte des données</h2>
        <p>Nous collectons les informations nécessaires au fonctionnement de nos trois activités :</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>ByGagoos Ink (Sérigraphie) :</strong> Identité, adresse de livraison, historique des commandes.</li>
          <li><strong>ByGagoos Trans (Taxi-Moto) :</strong> Localisation, numéro de téléphone, historique des trajets.</li>
          <li><strong>ByGagoos CDA (Restaurant) :</strong> Coordonnées pour les réservations, préférences alimentaires.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">2. Sécurité des Paiements</h2>
        <p>ByGagoos Prod n'enregistre jamais vos coordonnées bancaires. Les transactions sont sécurisées par nos partenaires financiers (MVola, Mobile Money, cartes bancaires).</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">3. Vos Droits</h2>
        <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Contact : <strong>positifaid@live.fr</strong></p>
      </section>
    </div>
  </LegalLayout>
);

export const TermsPage = () => (
  <LegalLayout title="Conditions d'Utilisation">
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">1. Les services ByGagoos Prod</h2>
        <p>ByGagoos Prod propose trois activités distinctes :</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li><strong>ByGagoos Ink :</strong> Prestations de marquage textile (sérigraphie) et design graphique.</li>
          <li><strong>ByGagoos Trans :</strong> Service de transport par Taxi-Moto.</li>
          <li><strong>ByGagoos CDA :</strong> Restaurant et bar.</li>
        </ul>
      </section>

      <section className="bg-gray-50 p-6 rounded-xl border">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>⚖️</span> Propriété Intellectuelle (ByGagoos Ink)
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Le client déclare détenir tous les droits sur les logos, images et textes fournis pour impression.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">2. Trans & CDA</h2>
        <p>Pour ByGagoos Trans, les tarifs sont communiqués avant chaque course. Pour ByGagoos CDA, les réservations sont confirmées sous 24h.</p>
      </section>
    </div>
  </LegalLayout>
);

export const CookiesPage = () => (
  <LegalLayout title="Gestion des Cookies">
    <div className="space-y-6">
      <p>Nous utilisons des cookies techniques pour assurer le bon fonctionnement de nos plateformes :</p>
      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left font-bold text-gray-700">Utilité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-6 py-4 font-medium">Session</td><td className="px-6 py-4">Maintien de votre connexion</td></tr>
            <tr><td className="px-6 py-4 font-medium">Préférences</td><td className="px-6 py-4">Mémorisation du thème (sombre/clair)</td></tr>
            <tr><td className="px-6 py-4 font-medium">Localisation</td><td className="px-6 py-4">Pour ByGagoos Trans (courses)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </LegalLayout>
);

export const ReturnsPage = () => (
  <LegalLayout title="Retours & Échanges">
    <div className="space-y-8">
      <div className="border-l-4 border-amber-500 bg-amber-50 p-6 rounded-r-xl">
        <h2 className="text-xl font-bold text-amber-800 mb-2">ByGagoos Ink - Produits Personnalisés</h2>
        <p className="text-sm text-amber-700">Une fois le Bon À Tirer (BAT) validé, aucune modification ou annulation n'est acceptée. En cas de défaut, contactez-nous sous 7 jours avec une photo.</p>
      </div>
      
      <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded-r-xl">
        <h2 className="text-xl font-bold text-cyan-800 mb-2">ByGagoos Trans - Annulation de course</h2>
        <p className="text-sm text-cyan-700">Annulation gratuite jusqu'à 5 minutes avant le départ. Passé ce délai, des frais peuvent s'appliquer.</p>
      </div>
      
      <div className="border-l-4 border-amber-500 bg-amber-50 p-6 rounded-r-xl">
        <h2 className="text-xl font-bold text-amber-800 mb-2">ByGagoos CDA - Annulation de réservation</h2>
        <p className="text-sm text-amber-700">Annulation gratuite jusqu'à 2 heures avant l'horaire réservé.</p>
      </div>
    </div>
  </LegalLayout>
);

export const HelpCenterPage = () => (
  <LegalLayout title="Centre d'Aide">
    <div className="space-y-12">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <h2 className="text-xl font-bold text-purple-800 mb-4">🎨 ByGagoos Ink</h2>
          <ul className="space-y-2 text-sm text-purple-700">
            <li>• Préparation des fichiers (vectorisation)</li>
            <li>• Choix du textile (coton, polyester)</li>
            <li>• Délais de production (5-10 jours)</li>
          </ul>
        </div>
        <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-200">
          <h2 className="text-xl font-bold text-cyan-800 mb-4">🏍️ ByGagoos Trans</h2>
          <ul className="space-y-2 text-sm text-cyan-700">
            <li>• Comment réserver une course ?</li>
            <li>• Tarifs et paiement</li>
            <li>• Suivi en temps réel</li>
          </ul>
        </div>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <h2 className="text-xl font-bold text-amber-800 mb-4">🍽️ ByGagoos CDA</h2>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• Réservation de table</li>
            <li>• Menus et horaires</li>
            <li>• Événements privés</li>
          </ul>
        </div>
      </div>
      <div className="text-center py-6 border-t border-dashed">
        <p className="text-gray-500">Besoin d'aide ? Contactez-nous : <strong>+261 34 43 593 30</strong></p>
      </div>
    </div>
  </LegalLayout>
);

export const FAQPage = () => (
  <LegalLayout title="Foire Aux Questions">
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Quels sont les minimums pour ByGagoos Ink ?</h3>
        <p className="text-gray-600">Minimum 10 pièces par visuel pour la sérigraphie.</p>
      </div>
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Comment réserver un Taxi-Moto ?</h3>
        <p className="text-gray-600">Via notre application ou par téléphone au +261 34 43 593 30.</p>
      </div>
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Faut-il réserver une table au restaurant ?</h3>
        <p className="text-gray-600">Recommandé pour le week-end et les groupes de plus de 6 personnes.</p>
      </div>
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Quels sont les modes de paiement acceptés ?</h3>
        <p className="text-gray-600">Espèces, MVola, Mobile Money, cartes bancaires.</p>
      </div>
      <div className="pt-4">
        <Link to="/contact" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          Vous n'avez pas trouvé votre réponse ? Contactez-nous
        </Link>
      </div>
    </div>
  </LegalLayout>
);

export const CareersPage = () => (
  <LegalLayout title="Rejoindre ByGagoos Prod">
    <div className="space-y-6">
      <p className="text-lg text-gray-700">ByGagoos Prod recrute pour ses trois activités !</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 border border-purple-200 rounded-lg text-center font-bold text-purple-700 bg-purple-50">Sérigraphe (Ink)</div>
        <div className="p-4 border border-cyan-200 rounded-lg text-center font-bold text-cyan-700 bg-cyan-50">Chauffeur (Trans)</div>
        <div className="p-4 border border-amber-200 rounded-lg text-center font-bold text-amber-700 bg-amber-50">Chef de rang (CDA)</div>
      </div>
      <p className="text-center mt-10 p-4 border rounded-lg bg-gray-50">
        Envoyez votre candidature à : <br />
        <span className="text-xl font-bold text-blue-600">positifaid@live.fr</span>
      </p>
      <div className="text-center pt-4">
        <Link to="/contact" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          Postuler maintenant
        </Link>
      </div>
    </div>
  </LegalLayout>
);

export const PressPage = () => (
  <LegalLayout title="Espace Presse">
    <div className="space-y-6">
      <p>ByGagoos Prod réunit trois activités complémentaires au service de la communauté malgache.</p>
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl text-white">
        <h3 className="text-xl font-bold mb-4">Kit Média ByGagoos Prod</h3>
        <p className="text-gray-400 text-sm mb-6">Logos, photos des activités et charte graphique.</p>
        <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
          Télécharger (.ZIP)
        </button>
      </div>
      <div className="text-center pt-4">
        <Link to="/contact" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <Mail className="h-4 w-4" />
          Contact presse
        </Link>
      </div>
    </div>
  </LegalLayout>
);