"use client";
import { createContext, useContext } from "react";
import { type Lang, type TKey, translate } from "./i18n";

const LangContext = createContext<Lang>("no");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT() {
  const lang = useContext(LangContext);
  return (key: TKey) => translate(key, lang);
}
