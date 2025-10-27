import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { modernTheme, radius, shadows, spacing } from '../../theme/modernTheme';

const ModernButton = ({
  text,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon: IconComponent,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getSizeStyles = () => {
    const sizes = {
      sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: 12,
      },
      md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        fontSize: 14,
      },
      lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        fontSize: 16,
      },
    };
    return sizes[size];
  };

  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: modernTheme.primary,
        borderColor: modernTheme.primary,
        textColor: modernTheme.white,
      },
      secondary: {
        backgroundColor: modernTheme.secondary,
        borderColor: modernTheme.secondary,
        textColor: modernTheme.white,
      },
      outline: {
        backgroundColor: modernTheme.white,
        borderColor: modernTheme.border,
        textColor: modernTheme.primary,
        borderWidth: 1.5,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: modernTheme.primary,
      },
      danger: {
        backgroundColor: modernTheme.error,
        borderColor: modernTheme.error,
        textColor: modernTheme.white,
      },
    };
    return variants[variant];
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          ...sizeStyles,
          backgroundColor: disabled ? modernTheme.disabled : variantStyles.backgroundColor,
          borderColor: disabled ? modernTheme.disabled : variantStyles.borderColor,
          borderRadius: radius.md,
          borderWidth: variantStyles.borderWidth || 0,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
        shadows.small,
      ]}
    >
      <View style={styles.content}>
        {leftIcon && !loading && (
          <View style={{ marginRight: spacing.sm }}>
            {typeof leftIcon === 'function' ? leftIcon() : leftIcon}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator
            size="small"
            color={disabled ? modernTheme.disabledText : variantStyles.textColor}
          />
        ) : (
          <>
            {IconComponent && (
              <IconComponent
                size={20}
                color={disabled ? modernTheme.disabledText : variantStyles.textColor}
                style={{ marginRight: spacing.sm }}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  color: disabled ? modernTheme.disabledText : variantStyles.textColor,
                  fontSize: sizeStyles.fontSize,
                },
                textStyle,
              ]}
            >
              {text}
            </Text>
          </>
        )}

        {rightIcon && !loading && (
          <View style={{ marginLeft: spacing.sm }}>
            {typeof rightIcon === 'function' ? rightIcon() : rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});

export default ModernButton;