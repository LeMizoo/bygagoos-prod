import { BarChart3, CalendarDays, Coffee, UtensilsCrossed, ChefHat, TableProperties } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";

export default function RestaurantDashboardPage() {
  return (
    <ActivityDashboardFrame
      title="ByGagoos CDA Dashboard"
      subtitle="Le dashboard futur du bar et du restaurant: réservation, service, salle et pilotage d’exploitation."
      accent="from-rose-600 via-orange-500 to-amber-400"
      icon={UtensilsCrossed}
      metrics={[
        { label: "Tables", value: "24", note: "Capacité d’accueil", icon: TableProperties },
        { label: "Réservations", value: "60+", note: "Demande à gérer", icon: CalendarDays },
        { label: "Services", value: "2", note: "Midi et soir", icon: Coffee },
        { label: "Organisation", value: "100%", note: "Base prête pour le module", icon: BarChart3 },
      ]}
      actions={[
        { label: "Préparer le module", path: "/contact" },
        { label: "Retour à l'accueil", path: "/home" },
      ]}
      focusItems={[
        { title: "Réservations", subtitle: "Accueil", meta: "Créneaux, confirmations et annulations." },
        { title: "Service de salle", subtitle: "Opérations", meta: "Suivi de commande et rotation des tables." },
        { title: "Cuisine", subtitle: "Production", meta: "Flux des plats et gestion du rythme." },
        { title: "Stock & caisse", subtitle: "Pilotage", meta: "Approvisionnement et clôture des services." },
      ]}
      processSteps={[
        "Définir les tables",
        "Ajouter les réservations",
        "Brancher le service",
        "Suivre la caisse",
      ]}
    />
  );
}
