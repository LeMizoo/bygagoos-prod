import { Bike, Gauge, Shield, Wrench, MapPin, Users } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";

export default function TaxiDashboardPage() {
  return (
    <ActivityDashboardFrame
      title="ByGagoos Trans Dashboard"
      subtitle="Le poste de contrôle de la flotte Taxi-Moto: véhicules, chauffeurs, maintenance et disponibilité."
      accent="from-sky-600 via-cyan-500 to-emerald-400"
      icon={Bike}
      metrics={[
        { label: "Véhicules", value: "12", note: "Flotte en service et à surveiller", icon: Bike },
        { label: "Disponibles", value: "8", note: "Prêts à être affectés", icon: Gauge },
        { label: "Maintenance", value: "2", note: "Interventions programmées", icon: Wrench },
        { label: "Conducteurs", value: "8", note: "Équipages affectés à la flotte", icon: Users },
      ]}
      actions={[
        { label: "Gérer les véhicules", path: "/admin/taxi/vehicles" },
        { label: "Voir les commandes", path: "/admin/orders" },
      ]}
      focusItems={[
        { title: "Disponibilité flotte", subtitle: "Exploitation", meta: "Voir les véhicules libres, loués ou hors ligne." },
        { title: "Maintenance", subtitle: "Sécurité", meta: "Planifier l’entretien et les réparations." },
        { title: "Affectation chauffeurs", subtitle: "Opérations", meta: "Associer les chauffeurs aux véhicules." },
        { title: "Zones d’activité", subtitle: "Terrain", meta: "Suivre les points chauds et les trajets récurrents." },
      ]}
      processSteps={[
        "Ajouter un véhicule",
        "Lancer l’affectation",
        "Contrôler la maintenance",
        "Analyser l’activité",
      ]}
    />
  );
}
