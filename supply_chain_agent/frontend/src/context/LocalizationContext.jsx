import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { setFormatterLocale } from "../utils/formatters"
import {
  detectPreferredLanguage,
  LOCALE_STORAGE_KEY,
  resolveSupportedLanguage,
  SUPPORTED_LANGUAGES,
  translate
} from "../utils/localization"

const LocalizationContext = createContext(null)

export function LocalizationProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const preferredLanguage = detectPreferredLanguage()
    setFormatterLocale(preferredLanguage.locale)
    return preferredLanguage
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    window.localStorage.setItem(LOCALE_STORAGE_KEY, language.locale)
    document.documentElement.lang = language.locale
    setFormatterLocale(language.locale)
  }, [language])

  const setLanguage = (nextLocale) => {
    setLanguageState(resolveSupportedLanguage(nextLocale))
  }

  const value = useMemo(
    () => ({
      language,
      locale: language.locale,
      languages: SUPPORTED_LANGUAGES,
      setLanguage,
      t: (key, vars) => translate(language.locale, key, vars)
    }),
    [language]
  )

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
}

export function useLocalization() {
  const context = useContext(LocalizationContext)
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider")
  }
  return context
}
