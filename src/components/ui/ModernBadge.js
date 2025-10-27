import { StyleSheet, Text, View } from 'react-native';
import { modernTheme, radius, spacing } from '../../theme/modernTheme';

const ModernBadge = ({
  text,
  variant = 'primary', // 'primary', 'secondary', 'success', 'warning', 'error', 'info'
  size = 'md', // 'sm', 'md', 'lg'
  outline = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantColors = () => {
    const colors = {
      primary: {
        bg: modernTheme.primary,
        text: modernTheme.white,
        outline: modernTheme.primary,
      },
      secondary: {
        bg: modernTheme.secondary,
        text: modernTheme.white,
        outline: modernTheme.secondary,
      },
      success: {
        bg: modernTheme.success,
        text: modernTheme.white,
        outline: modernTheme.success,
      },
      warning: {
        bg: modernTheme.warning,
        text: modernTheme.white,
        outline: modernTheme.warning,
      },
      error: {
        bg: modernTheme.error,
        text: modernTheme.white,
        outline: modernTheme.error,
      },
      info: {
        bg: modernTheme.info,
        text: modernTheme.white,
        outline: modernTheme.info,
      },
    };
    return colors[variant];
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        fontSize: 11,
      },
      md: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 12,
      },
      lg: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: 14,
      },
    };
    return sizes[size];
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: outline ? 'transparent' : variantColors.bg,
          borderColor: variantColors.outline,
          borderWidth: outline ? 1.5 : 0,
          borderRadius: radius.full,
          ...sizeStyles,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: outline ? variantColors.outline : variantColors.text,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});

export default ModernBadge;