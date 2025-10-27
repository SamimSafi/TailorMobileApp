import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { modernTheme, radius, spacing, typography } from '../../theme/modernTheme';

const ModernInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  errorText,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  style,
  containerStyle,
  focusedStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setShowPassword(!showPassword);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? modernTheme.error : modernTheme.text },
          ]}
        >
          {label}
          {error && <Text style={{ color: modernTheme.error }}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error
              ? modernTheme.error
              : isFocused
              ? modernTheme.primary
              : modernTheme.border,
            backgroundColor: disabled ? modernTheme.disabled : modernTheme.white,
            borderRadius: radius.md,
          },
          isFocused && focusedStyle,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconLeft}>
            {typeof leftIcon === 'function' ? leftIcon() : leftIcon}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: disabled ? modernTheme.disabledText : modernTheme.text,
              flex: 1,
            },
            style,
          ]}
          placeholder={placeholder}
          placeholderTextColor={modernTheme.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />

        {secureTextEntry || rightIcon ? (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={handleRightIconPress}
            disabled={disabled}
          >
            {secureTextEntry ? (
              showPassword ? (
                <Eye size={20} color={modernTheme.textSecondary} />
              ) : (
                <EyeOff size={20} color={modernTheme.textSecondary} />
              )
            ) : rightIcon ? (
              typeof rightIcon === 'function' ? (
                rightIcon()
              ) : (
                rightIcon
              )
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>

      {error && errorText && (
        <Text style={[styles.errorText, { color: modernTheme.error }]}>
          {errorText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelLarge,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    paddingVertical: spacing.md,
    ...typography.bodyMedium,
  },
  iconLeft: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  iconRight: {
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  errorText: {
    ...typography.labelSmall,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

export default ModernInput;