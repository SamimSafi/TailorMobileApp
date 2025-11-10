/**
 * ENHANCED MODERN BUTTON
 * Professional button component with:
 * - Multiple variants (primary, secondary, tertiary, danger)
 * - Multiple sizes (small, medium, large)
 * - Loading, disabled, and success states
 * - Ripple and scale animations
 * - Haptic feedback
 * - Full accessibility support
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  animation,
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../../theme/enhancedTheme';

const ModernButtonEnhanced = ({
  title = 'Button',
  onPress = () => {},
  variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  loading = false,
  disabled = false,
  success = false,
  icon = null, // Icon name (string for Ionicons) or React element/component
  iconPosition = 'left', // 'left' | 'right'
  fullWidth = false,
  outline = false,
  testID = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Variant colors
  const variantColors = {
    primary: {
      bg: colors.primary,
      text: colors.surface,
      outline: colors.primary,
    },
    secondary: {
      bg: colors.secondary,
      text: colors.surface,
      outline: colors.secondary,
    },
    tertiary: {
      bg: colors.neutral100,
      text: colors.text,
      outline: colors.neutral300,
    },
    danger: {
      bg: colors.error,
      text: colors.surface,
      outline: colors.error,
    },
  };

  // Size configurations
  const sizeConfig = {
    small: {
      height: 36,
      paddingHorizontal: spacing.md,
      fontSize: typography.labelMedium.fontSize,
      fontWeight: '600',
      borderRadius: borderRadius.sm,
    },
    medium: {
      height: 44,
      paddingHorizontal: spacing.lg,
      fontSize: typography.labelLarge.fontSize,
      fontWeight: '600',
      borderRadius: borderRadius.md,
    },
    large: {
      height: 52,
      paddingHorizontal: spacing.xl,
      fontSize: typography.titleSmall.fontSize,
      fontWeight: '600',
      borderRadius: borderRadius.lg,
    },
  };

  const config = sizeConfig[size] ?? sizeConfig.medium;
  const colorScheme = variantColors[variant];

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!loading && !disabled) {
      onPress();
      
      // Show success state animation
      if (success) {
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
            delay: 500,
          }),
        ]).start();
      }
    }
  };

  const buttonBgColor = outline ? colors.surface : colorScheme.bg;
  const buttonBorderColor = outline ? colorScheme.outline : 'transparent';
  const buttonTextColor = outline ? colorScheme.text : colorScheme.text;

  const opacity = disabled ? 0.5 : 1;

  // Render icon safely
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <Ionicons
          name={icon}
          size={config.fontSize + 4}
          color={buttonTextColor}
        />
      );
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function') {
      return React.createElement(icon, {
        size: config.fontSize + 4,
        color: buttonTextColor,
      });
    }
    return null;
  };

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        {
          transform: [{ scale: scaleAnim }],
          width: fullWidth ? '100%' : 'auto',
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            height: config.height,
            paddingHorizontal: config.paddingHorizontal,
            borderRadius: config.borderRadius,
            backgroundColor: buttonBgColor,
            borderWidth: outline ? 1.5 : 0,
            borderColor: buttonBorderColor,
            opacity,
          },
          !outline && shadows.sm,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        accessibilityLabel={title}
      >
        <View style={styles.contentContainer}>
          {/* Loading Indicator */}
          {loading && (
            <ActivityIndicator
              size={size === 'small' ? 'small' : 'small'}
              color={buttonTextColor}
              style={styles.loadingSpinner}
            />
          )}

          {/* Left Icon */}
          {!loading && icon && iconPosition === 'left' && (
            <View style={styles.iconSpacing}>{renderIcon()}</View>
          )}

          {/* Title or Success */}
          {!loading && (
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: config.fontSize,
                  fontWeight: config.fontWeight,
                  color: buttonTextColor,
                },
              ]}
              numberOfLines={1}
            >
              {success ? '✓' : title}
            </Text>
          )}

          {/* Right Icon */}
          {!loading && icon && iconPosition === 'right' && (
            <View style={styles.iconSpacing}>{renderIcon()}</View>
          )}

          {/* Loading Text (inside container for consistency) */}
          {loading && (
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: config.fontSize,
                  fontWeight: config.fontWeight,
                  color: buttonTextColor,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    fontWeight: '600',
  },
  iconSpacing: {
    marginHorizontal: spacing.sm,
  },
  loadingSpinner: {
    marginRight: spacing.sm,
  },
});

export default ModernButtonEnhanced;