import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { LANGUAGE_NAMES, LANGUAGES } from '../i18n';
import { useLanguageStore } from '../store/languageStore';

/**
 * Custom hook for using language/translation features
 * Provides easy access to translations and language utilities
 * 
 * Usage:
 * const { t, language, isRTL, direction, changeLanguage } = useLanguage();
 */
export const useLanguage = () => {
  const [isRTLReady, setIsRTLReady] = useState(false);
  
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const translations = useLanguageStore((state) => state.translations);
  const storeT = useLanguageStore((state) => state.t);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const isRTL = useLanguageStore((state) => state.isRTL);
  const getDirection = useLanguageStore((state) => state.getDirection);

  // Update React Native I18nManager when language changes
  useEffect(() => {
    const shouldBeRTL = isRTL();
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      // Note: Full RTL support requires app restart in React Native
      // This will apply to newly loaded components
    }
    setIsRTLReady(true);
  }, [currentLanguage]);

  return {
    /**
     * Translation function - get translated string
     * Usage: t('common.save')
     */
    t: storeT,

    /**
     * Get all translations object for current language
     */
    translations,

    /**
     * Current language code (en, da, ps)
     */
    language: currentLanguage,

    /**
     * Human-readable language name
     */
    languageName: LANGUAGE_NAMES[currentLanguage],

    /**
     * Check if current language is Right-to-Left
     */
    isRTL: isRTL(),

    /**
     * Get text direction (rtl or ltr)
     */
    direction: getDirection(),

    /**
     * Is RTL mode ready
     */
    isRTLReady,

    /**
     * Available languages
     */
    availableLanguages: [
      { code: LANGUAGES.EN, name: LANGUAGE_NAMES.en },
      { code: LANGUAGES.DA, name: LANGUAGE_NAMES.da },
      { code: LANGUAGES.PS, name: LANGUAGE_NAMES.ps },
    ],

    /**
     * Change application language
     * @param {string} languageCode - Language code (en, da, ps)
     */
    changeLanguage: async (languageCode) => {
      const success = await setLanguage(languageCode);
      if (success) {
        console.log('Language changed to:', languageCode);
      }
      return success;
    },

    /**
     * Get alignment style based on language direction
     * Usage: <View style={[styles.container, getAlignStyle('row')]}>
     */
    getAlignStyle: (direction = 'row') => {
      const isCurrentRTL = isRTL();
      if (direction === 'row') {
        return { flexDirection: isCurrentRTL ? 'row-reverse' : 'row' };
      }
      return {};
    },

    /**
     * Get margin style based on language direction
     * Usage: getMarginStyle('left', 10) -> { marginRight: 10 } if RTL
     */
    getMarginStyle: (side, value) => {
      const isCurrentRTL = isRTL();
      if (!isCurrentRTL) {
        return { [`margin${side.charAt(0).toUpperCase() + side.slice(1)}`]: value };
      }
      
      // Swap sides for RTL
      const sideMap = { left: 'right', right: 'left', top: 'top', bottom: 'bottom' };
      const swappedSide = sideMap[side] || side;
      return { [`margin${swappedSide.charAt(0).toUpperCase() + swappedSide.slice(1)}`]: value };
    },

    /**
     * Get padding style based on language direction
     */
    getPaddingStyle: (side, value) => {
      const isCurrentRTL = isRTL();
      if (!isCurrentRTL) {
        return { [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: value };
      }
      
      // Swap sides for RTL
      const sideMap = { left: 'right', right: 'left', top: 'top', bottom: 'bottom' };
      const swappedSide = sideMap[side] || side;
      return { [`padding${swappedSide.charAt(0).toUpperCase() + swappedSide.slice(1)}`]: value };
    },

    /**
     * Align text based on language direction
     * Usage: textAlign={getTextAlign()}
     */
    getTextAlign: () => {
      const isCurrentRTL = isRTL();
      return isCurrentRTL ? 'right' : 'left';
    },

    /**
     * Get RTL-aware flex direction
     * Usage: flexDirection={getFlexDirection('row')}
     */
    getFlexDirection: (direction = 'row') => {
      const isCurrentRTL = isRTL();
      if (direction === 'row') {
        return isCurrentRTL ? 'row-reverse' : 'row';
      }
      return direction;
    },

    /**
     * Format currency based on language
     */
    formatCurrency: (amount, currencyCode = 'AFN') => {
      try {
        return new Intl.NumberFormat(currentLanguage === 'en' ? 'en-US' : `${currentLanguage}-AF`, {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: 0,
        }).format(amount);
      } catch (error) {
        return `${amount} ${currencyCode}`;
      }
    },

    /**
     * Format date based on language
     */
    formatDate: (date, options = {}) => {
      try {
        const locale = currentLanguage === 'en' ? 'en-US' : `${currentLanguage}-AF`;
        return new Intl.DateTimeFormat(locale, options).format(new Date(date));
      } catch (error) {
        return new Date(date).toLocaleDateString();
      }
    },

    /**
     * Get month name in current language
     */
    getMonthName: (monthIndex) => {
      const monthKey = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ][monthIndex];
      return storeT(`dateTime.${monthKey}`);
    },

    /**
     * Get day name in current language
     */
    getDayName: (dayIndex) => {
      const dayKey = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ][dayIndex];
      return storeT(`dateTime.${dayKey}`);
    },
  };
};

export default useLanguage;