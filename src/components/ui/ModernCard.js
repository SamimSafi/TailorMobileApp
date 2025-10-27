import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { modernTheme, radius, shadows, spacing, typography } from '../../theme/modernTheme';

const ModernCard = ({
  title,
  subtitle,
  description,
  children,
  onPress,
  style,
  titleStyle,
  pressable = false,
  elevated = true,
  variant = 'default', // 'default', 'outlined', 'elevated'
  badge,
  badgeColor = modernTheme.primary,
  icon,
  rightContent,
  actionButton,
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        backgroundColor: modernTheme.white,
        borderColor: modernTheme.border,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: modernTheme.white,
        borderColor: modernTheme.border,
        borderWidth: 1,
      },
      elevated: {
        backgroundColor: modernTheme.white,
        borderColor: 'transparent',
        borderWidth: 0,
      },
    };
    return variants[variant];
  };

  const variantStyles = getVariantStyles();
  const shadow = elevated && variant === 'elevated' ? shadows.small : {};

  const CardContent = (
    <>
      {/* Header with Icon and Title */}
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}

        <View style={styles.titleContainer}>
          {title && (
            <Text style={[styles.title, titleStyle]}>
              {title}
              {badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeColor },
                  ]}
                >
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>

        {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
      </View>

      {/* Description */}
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {/* Children Content */}
      {children && <View style={styles.content}>{children}</View>}

      {/* Action Button */}
      {actionButton && <View style={styles.actionButton}>{actionButton}</View>}
    </>
  );

  return pressable || onPress ? (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          ...variantStyles,
          borderRadius: radius.lg,
        },
        shadow,
        style,
      ]}
    >
      {CardContent}
    </TouchableOpacity>
  ) : (
    <View
      style={[
        styles.card,
        {
          ...variantStyles,
          borderRadius: radius.lg,
        },
        shadow,
        style,
      ]}
    >
      {CardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.titleMedium,
    color: modernTheme.text,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  badgeText: {
    ...typography.labelSmall,
    color: modernTheme.white,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
  },
  rightContent: {
    marginLeft: spacing.md,
  },
  description: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  content: {
    marginVertical: spacing.md,
  },
  actionButton: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: modernTheme.divider,
  },
});

export default ModernCard;