import { create } from 'zustand';
import { DEFAULT_LANGUAGE, LANGUAGES, getTranslations } from '../i18n';
import { storage } from '../utils/storage';

/**
 * Language Store - Manages app language selection
 * Persists language preference to device storage
 */
export const useLanguageStore = create((set, get) => ({
  // State
  currentLanguage: DEFAULT_LANGUAGE,
  translations: getTranslations(DEFAULT_LANGUAGE),
  isInitialized: false,

  /**
   * Initialize language from storage
   * Should be called once when app starts
   */
  initializeLanguage: async () => {
    try {
      const state = get();
      if (state.isInitialized) {
        console.log('Language store already initialized');
        return;
      }

      // Try to get saved language from storage
      const savedLanguage = await storage.getItem('appLanguage');
      const languageToUse = savedLanguage || DEFAULT_LANGUAGE;

      console.log('✓ Language initialized:', languageToUse);

      set({
        currentLanguage: languageToUse,
        translations: getTranslations(languageToUse),
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error initializing language:', error);
      set({ isInitialized: true });
    }
  },

  /**
   * Change application language
   * @param {string} languageCode - Language code (en, da, ps)
   */
  setLanguage: async (languageCode) => {
    try {
      // Validate language code
      if (!Object.values(LANGUAGES).includes(languageCode)) {
        console.error('Invalid language code:', languageCode);
        return false;
      }

      // Get new translations
      const newTranslations = getTranslations(languageCode);

      // Save to storage
      await storage.setItem('appLanguage', languageCode);

      console.log('✓ Language changed to:', languageCode);

      // Update store
      set({
        currentLanguage: languageCode,
        translations: newTranslations,
      });

      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  },

  /**
   * Get current language code
   */
  getLanguage: () => {
    return get().currentLanguage;
  },

  /**
   * Get all translations for current language
   */
  getTranslations: () => {
    return get().translations;
  },

  /**
   * Get a specific translation value
   * @param {string} key - Translation key (e.g., 'common.save')
   * @param {string} defaultValue - Fallback value
   */
  t: (key, defaultValue = key) => {
    const translations = get().translations;
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return typeof value === 'string' ? value : defaultValue;
  },

  /**
   * Check if current language is RTL (Dari, Pashto)
   */
  isRTL: () => {
    const lang = get().currentLanguage;
    return lang === LANGUAGES.DA || lang === LANGUAGES.PS;
  },

  /**
   * Get text direction based on current language
   */
  getDirection: () => {
    return get().isRTL() ? 'rtl' : 'ltr';
  },

  /**
   * Reset to default language
   */
  resetLanguage: async () => {
    try {
      await storage.removeItem('appLanguage');
      set({
        currentLanguage: DEFAULT_LANGUAGE,
        translations: getTranslations(DEFAULT_LANGUAGE),
      });
      console.log('✓ Language reset to default:', DEFAULT_LANGUAGE);
    } catch (error) {
      console.error('Error resetting language:', error);
    }
  },
}));