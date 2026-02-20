// frontend/src/components/ui/Icon.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface IconProps {
  icon: LucideIcon;
  size?: number | string;
  className?: string;
  showAlways?: boolean; // Force l'affichage même si mode hide
  minimal?: boolean; // Mode minimal (juste l'icône sans texte)
}

export function Icon({
  icon: IconComponent,
  size = 20,
  className = "",
  showAlways = false,
  minimal = false,
}: IconProps) {
  const { iconVisibility } = useTheme();

  // Si showAlways est true, toujours afficher
  if (showAlways) {
    return <IconComponent size={size} className={className} />;
  }

  // Gestion des différentes visibilités
  switch (iconVisibility) {
    case "hide":
      return null;
    case "minimal":
      return minimal ? (
        <IconComponent size={size} className={className} />
      ) : null;
    case "show":
    default:
      return <IconComponent size={size} className={className} />;
  }
}
