/**
 * ENHANCED MODERN INPUT
 * Professional form input with:
 * - Floating labels with smooth animations
 * - Validation states (success, error, loading)
 * - Character counter
 * - Helper text with icons
 * - Excellent keyboard handling
 */

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {
    borderRadius,
    colors,
    spacing,
    typography
} from '../../theme/enhancedTheme';

const ModernInputEnhanced = ({
  placeholder = 'Enter text',
  value = '',
  onChangeText = () => {},
  onFocus = () => {},
  onBlur = () => {},
  error = '',
  success = false,
  loading = false,
  type = 'text', // 'text' | 'email' | 'phone' | 'password'
  maxLength = null,
  showCharCounter = false,
  helperText = '',
  leftIcon = null,
  rightIcon = null,
  onRightIconPress = () => {},
  disabled = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  returnKeyType = 'next',
  testID = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  // Keyboard type mapping
  const keyboardTypeMap = {
    text: 'default',
    email: 'email-address',
    phone: 'phone-pad',
    password: 'default',
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateLabelUp();
    onFocus();
  };

  const handleBlur = () => {
    if (!value) {
      animateLabelDown();
    }
    setIsFocused(false);
    onBlur();
  };

  const animateLabelUp = () => {
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const animateLabelDown = () => {
    Animated.timing(labelAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleChangeText = (text) => {
    onChangeText(text);
    if (text && !isFocused) {
      animateLabelUp();
    }
  };

  // Determine border color based on state
  let borderColor = colors.border;
  let backgroundColor = colors.surface;

  if (error) {
    borderColor = colors.error;
    backgroundColor = colors.error_bg;
  } else if (success) {
    borderColor = colors.success;
    backgroundColor = colors.success_bg;
  } else if (isFocused) {
    borderColor = colors.primary;
    backgroundColor = colors.primaryLighter;
  }

  // Label animation values
  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const labelTranslateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [spacing.md, -spacing.xl],
  });

  const labelOpacity = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const charCountColor =
    value.length === maxLength ? colors.warning : colors.textTertiary;

  return (
    <View style={styles.container}>
      {/* Label (Floating) */}
      <Animated.Text
        style={[
          styles.label,
          {
            transform: [
              { scale: labelScale },
              { translateY: labelTranslateY },
            ],
            opacity: labelOpacity,
          },
          isFocused && styles.labelFocused,
          error && styles.labelError,
          success && styles.labelSuccess,
        ]}
      >
        {placeholder}
      </Animated.Text>

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
          },
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.iconLeft}>
            {typeof leftIcon === 'string' ? (
              <Ionicons name={leftIcon} size={20} color={colors.primary} />
            ) : (
              leftIcon
            )}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
          ]}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardTypeMap[type]}
          secureTextEntry={type === 'password'}
          editable={editable && !disabled}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          testID={testID}
          caretHidden={disabled}
        />

        {/* Right Icon / Status Indicator */}
        <View style={styles.iconRight}>
          {loading ? (
            <Ionicons
              name="refresh"
              size={20}
              color={colors.info}
              style={styles.spinningIcon}
            />
          ) : success ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          ) : error ? (
            <Ionicons
              name="alert-circle"
              size={20}
              color={colors.error}
            />
          ) : rightIcon ? (
            <TouchableOpacity onPress={onRightIconPress}>
              {typeof rightIcon === 'string' ? (
                <Ionicons name={rightIcon} size={20} color={colors.primary} />
              ) : (
                rightIcon
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Helper Text / Error Message */}
      {(error || helperText || showCharCounter) && (
        <View style={styles.helperRow}>
          {error && (
            <View style={styles.errorMessage}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={[styles.helperText, styles.errorText]}>{error}</Text>
            </View>
          )}
          {helperText && !error && (
            <View style={styles.helperMessage}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={colors.info}
              />
              <Text style={[styles.helperText, styles.infoText]}>
                {helperText}
              </Text>
            </View>
          )}
          {showCharCounter && maxLength && (
            <Text style={[styles.charCounter, { color: charCountColor }]}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '400',
    color: colors.textSecondary,
    zIndex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: '600',
  },
  labelError: {
    color: colors.error,
  },
  labelSuccess: {
    color: colors.success,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    marginVertical: spacing.sm,
    height: 56,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: typography.bodyMedium.fontSize,
    color: colors.text,
    padding: 0,
    paddingVertical: spacing.md,
  },
  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: spacing.sm,
  },
  inputMultiline: {
    paddingVertical: spacing.md,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinningIcon: {
    // Animation can be applied here
  },
  helperRow: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helperMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helperText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    fontWeight: '400',
  },
  errorText: {
    color: colors.error,
  },
  infoText: {
    color: colors.info,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
});

export default ModernInputEnhanced;