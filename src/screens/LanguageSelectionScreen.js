import { Check } from 'lucide-react-native';
import { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { colors } from '../theme/colors';
import { radius, shadows, spacing, typography } from '../theme/modernTheme';
import { toastSuccess } from '../utils/toastManager';

const LanguageSelectionScreen = ({ navigation }) => {
  const { t, language, changeLanguage, availableLanguages } = useLanguage();

  const handleLanguageSelect = useCallback(
    async (languageCode) => {
      try {
        const success = await changeLanguage(languageCode);
        if (success) {
          const languageName = availableLanguages.find((l) => l.code === languageCode)?.name;
          toastSuccess(`${t('settings.languageChanged')} ${languageName}`);
          // Brief delay to show toast before navigation
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }
      } catch (error) {
        console.error('Error changing language:', error);
      }
    },
    [changeLanguage, availableLanguages, t, navigation]
  );

  const renderLanguageOption = (lang) => {
    const isSelected = lang.code === language;

    return (
      <TouchableOpacity
        key={lang.code}
        onPress={() => handleLanguageSelect(lang.code)}
        style={[
          styles.languageOption,
          isSelected && styles.languageOptionSelected,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <Text
            style={[
              styles.languageName,
              isSelected && styles.languageNameSelected,
            ]}
          >
            {lang.name}
          </Text>
          <Text
            style={[
              styles.languageCode,
              isSelected && styles.languageCodeSelected,
            ]}
          >
            {lang.code.toUpperCase()}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Check size={24} color={colors.primary} strokeWidth={3} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.selectLanguage')}</Text>
          <Text style={styles.subtitle}>{t('common.language')}</Text>
        </View>

        {/* Language Options */}
        <View style={styles.languageList}>
          {availableLanguages.map((lang) => renderLanguageOption(lang))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>
              {t('common.language')} • {availableLanguages.length} {t('common.language')}s
            </Text>
          </View>
          <Text style={styles.infoDescription}>
            Select your preferred language. The app will restart with the new language.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.displaySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  languageList: {
    marginBottom: spacing.xxl,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.medium,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderBottomColor: colors.primary,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  languageNameSelected: {
    color: colors.primary,
  },
  languageCode: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  languageCodeSelected: {
    color: colors.primary,
  },
  checkmarkContainer: {
    marginLeft: spacing.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoBadge: {
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoDescription: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
});

export default LanguageSelectionScreen;