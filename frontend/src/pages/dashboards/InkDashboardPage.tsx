import { BarChart3, Palette, ShoppingCart, Users, Sparkles } from "lucide-react";
import ActivityDashboardFrame from "../../components/dashboard/ActivityDashboardFrame";

export default function InkDashboardPage() {
  return (
    <ActivityDashboardFrame
      title="ByGagoos Ink Dashboard"
      subtitle="L’espace central pour la sérigraphie: designs, commandes, clients et production."
      accent="from-amber-600 via-orange-500 to-amber-400"
      icon={Palette}
      metrics={[
        { label: "Designs actifs", value: "89", note: "Catalogue visible à la galerie", icon: Palette },
        { label: "Commandes du mois", value: "156", note: "Suivi de production et validation", icon: ShoppingCart },
        { label: "Clients", value: "500+", note: "Comptes existants et nouveaux leads", icon: Users },
        { label: "Performance", value: "98%", note: "Taux de satisfaction", icon: BarChart3 },
      ]}
      actions={[
        { label: "Ouvrir la galerie", path: "/gallery" },
        { label: "Gérer les commandes", path: "/admin/orders" },
      ]}
      focusItems={[
        { title: "Designs populaires", subtitle: "Création", meta: "Mise en avant des modèles les plus vus." },
        { title: "Commandes urgentes", subtitle: "Production", meta: "Ce qui doit partir en priorité à l’atelier." },
        { title: "Clients récents", subtitle: "Relation client", meta: "Nouvelles demandes et suivis à relancer." },
        { title: "Nouveaux contenus", subtitle: "Marketing", meta: "Idées à publier pour faire grandir la marque." },
      ]}
      processSteps={[
        "Créer ou modifier un design",
        "Lancer une commande",
        "Suivre la production",
        "Livrer et archiver",
      ]}
    />
  );
}
