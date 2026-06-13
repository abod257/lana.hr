"use client";

import * as React from "react";
import { translate, type Locale } from "@/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
}

const LocaleContext = React.createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  children,
  defaultLocale = "ar",
  supportedLocales = ["ar", "en"],
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
  supportedLocales?: Locale[];
}) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);

  React.useEffect(() => {
    // Load from localStorage if present
    const saved = localStorage.getItem("hrms-locale") as Locale;
    if (saved && supportedLocales.includes(saved)) {
      setLocaleState(saved);
    }
  }, [supportedLocales]);

  React.useEffect(() => {
    // Update HTML attributes
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("hrms-locale", locale);
  }, [locale]);

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale, key, params);
    },
    [locale]
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
