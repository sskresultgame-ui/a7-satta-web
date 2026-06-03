"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "hi" | "en";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "hi",
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("hi");
  const toggleLang = () => setLang((prev) => (prev === "hi" ? "en" : "hi"));
  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function t(hi: string, en: string, lang: Lang): string {
  return lang === "hi" ? hi : en;
}
