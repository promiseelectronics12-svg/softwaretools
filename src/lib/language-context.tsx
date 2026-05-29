"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations } from "@/lib/translations";

type Lang = "en" | "bn";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: typeof translations["en"];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = useCallback(
    () => setLang((l) => (l === "en" ? "bn" : "en")),
    []
  );
  const t = translations[lang] as typeof translations["en"];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
