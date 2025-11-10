// Localization Index - Dari, Pashto, and English
import { da } from './da';
import { en } from './en';
import { ps } from './ps';

// Supported languages
export const LANGUAGES = {
  EN: 'en',
  DA: 'da',
  PS: 'ps',
};

export const LANGUAGE_NAMES = {
  en: 'English',
  da: 'دری (Dari)',
  ps: 'پښتو (Pashto)',
};

// All translations
export const translations = {
  en,
  da,
  ps,
};

// Default language
export const DEFAULT_LANGUAGE = 'en';

/**
 * Get translation object for a specific language
 * @param {string} language - Language code (en, da, ps)
 * @returns {object} Translation object
 */
export const getTranslations = (language) => {
  return translations[language] || translations[DEFAULT_LANGUAGE];
};

/**
 * Get a specific translation value with fallback
 * @param {object} t - Translation object
 * @param {string} key - Translation key (e.g., 'common.save')
 * @param {string} defaultValue - Fallback value
 * @returns {string} Translation value
 */
export const getTranslationValue = (t, key, defaultValue = key) => {
  const keys = key.split('.');
  let value = t;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return typeof value === 'string' ? value : defaultValue;
};

export default translations;