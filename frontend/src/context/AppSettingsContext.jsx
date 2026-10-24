import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../translations";
import { C } from "../pages/Sidebar";

const AppSettingsContext = createContext();

export function getTheme(darkMode) {
  return darkMode
    ? {
        ...C,
        bg: "#0F172A",
        card: "#111827",
        border: "#334155",
        text: "#F8FAFC",
        muted: "#CBD5E1",
      }
    : C;
}

export function AppSettingsProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "fr");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("dark_mode") === "true");

  const theme = getTheme(darkMode);
  const t = translations[language] || translations.fr;

  useEffect(() => {
    document.body.style.background = darkMode ? "#0F172A" : "#F8F7FF";
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language, darkMode]);

  const updateGlobalSettings = ({ language: newLang, dark_mode }) => {
    if (newLang) {
      setLanguage(newLang);
      localStorage.setItem("language", newLang);
    }

    if (typeof dark_mode === "boolean") {
      setDarkMode(dark_mode);
      localStorage.setItem("dark_mode", dark_mode ? "true" : "false");
    }
  };

  return (
    <AppSettingsContext.Provider value={{ language, darkMode, theme, t, updateGlobalSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}