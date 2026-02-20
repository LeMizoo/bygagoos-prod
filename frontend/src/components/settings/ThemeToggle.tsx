// frontend/src/components/settings/ThemeToggle.tsx
import { Sun, Moon, Monitor, Eye, EyeOff, Sparkles } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, iconVisibility, toggleTheme, toggleIcons } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Monitor;
    }
  };

  const getIconVisibilityIcon = () => {
    switch (iconVisibility) {
      case "show":
        return Eye;
      case "hide":
        return EyeOff;
      default:
        return Sparkles;
    }
  };

  const ThemeIcon = getThemeIcon();
  const IconVisibilityIcon = getIconVisibilityIcon();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title={`Thème: ${theme}`}
      >
        <ThemeIcon size={20} className="text-gray-700 dark:text-gray-300" />
      </button>
      <button
        onClick={toggleIcons}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title={`Icônes: ${iconVisibility}`}
      >
        <IconVisibilityIcon
          size={20}
          className="text-gray-700 dark:text-gray-300"
        />
      </button>
    </div>
  );
}
