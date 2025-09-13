import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Translation files
import enTranslations from "./locales/en.json"
import esTranslations from "./locales/es.json"
import koTranslations from "./locales/ko.json"
import jaTranslations from "./locales/ja.json"

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
  ko: {
    translation: koTranslations,
  },
  ja: {
    translation: jaTranslations,
  },
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("language") || "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    fallbackLng: "en", // use en if detected lng is not available

    keySeparator: ".", // we use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already does escaping
    },

    react: {
      useSuspense: false,
    },
  })

export default i18n
