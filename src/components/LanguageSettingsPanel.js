import { ChevronRight, Globe } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/modernTheme';

/**
 * Language Settings Panel Component
 * Displays current language and allows navigation to language selection
 */
export const LanguageSettingsPanel = ({ onPress }) => {
  const { t, language, languageName } = useLanguage();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Globe size={24} color={colors.primary} strokeWidth={2} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.label}>{t('settings.language')}</Text>
          <Text style={styles.value}>{languageName}</Text>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  value: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  chevronContainer: {
    marginLeft: spacing.md,
  },
});

export default LanguageSettingsPanel;