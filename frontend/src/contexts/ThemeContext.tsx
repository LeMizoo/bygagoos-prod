// frontend/src/contexts/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "auto";
type IconVisibility = "show" | "hide" | "minimal";

interface ThemeContextType {
  theme: Theme;
  iconVisibility: IconVisibility;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  setIconVisibility: (visibility: IconVisibility) => void;
  toggleTheme: () => void;
  toggleIcons: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Récupérer les préférences depuis localStorage ou les préférences système
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "auto";
  });

  const [iconVisibility, setIconVisibilityState] = useState<IconVisibility>(
    () => {
      const saved = localStorage.getItem("iconVisibility") as IconVisibility;
      return saved || "show";
    },
  );

  // Déterminer si le mode sombre est actif
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateDarkMode = () => {
      if (theme === "auto") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setIsDarkMode(prefersDark);
        document.documentElement.classList.toggle("dark", prefersDark);
      } else {
        const isDark = theme === "dark";
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
      }
    };

    updateDarkMode();

    // Écouter les changements de préférences système
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "auto") updateDarkMode();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Appliquer la visibilité des icônes
  useEffect(() => {
    document.documentElement.setAttribute("data-icons", iconVisibility);
  }, [iconVisibility]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setIconVisibility = (visibility: IconVisibility) => {
    setIconVisibilityState(visibility);
    localStorage.setItem("iconVisibility", visibility);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "auto" : "light");
  };

  const toggleIcons = () => {
    setIconVisibility(
      iconVisibility === "show"
        ? "hide"
        : iconVisibility === "hide"
          ? "minimal"
          : "show",
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        iconVisibility,
        isDarkMode,
        setTheme,
        setIconVisibility,
        toggleTheme,
        toggleIcons,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
