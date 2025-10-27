import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { modernTheme, radius, spacing, typography } from '../../theme/modernTheme';
import { getToastBackgroundColor, getToastColor, setToastCallback } from '../../utils/toastManager';

const ModernToast = () => {
  const [toast, setToast] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    setToastCallback((toastOptions) => {
      showToastInternal(toastOptions);
    });
  }, []);

  const getIcon = (type) => {
    const iconProps = {
      size: 24,
      color: getToastColor(type),
    };

    const icons = {
      success: <CheckCircle {...iconProps} />,
      error: <AlertCircle {...iconProps} />,
      warning: <AlertTriangle {...iconProps} />,
      info: <Info {...iconProps} />,
    };

    return icons[type] || icons.info;
  };

  const showToastInternal = (toastOptions) => {
    const { type = 'info', message, title, duration = 3000, position = 'top' } = toastOptions;

    setToast({
      type,
      message,
      title,
      position,
    });

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToast(null);
      });
    }, duration);

    return () => clearTimeout(timer);
  };

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToast(null);
    });
  };

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          top: toast.position === 'top' ? spacing.lg : undefined,
          bottom: toast.position === 'bottom' ? spacing.lg : undefined,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: getToastBackgroundColor(toast.type),
            borderLeftColor: getToastColor(toast.type),
          },
        ]}
      >
        <View style={styles.iconContainer}>{getIcon(toast.type)}</View>

        <View style={styles.content}>
          {toast.title && (
            <Text style={[styles.title, { color: modernTheme.text }]}>
              {toast.title}
            </Text>
          )}
          {toast.message && (
            <Text
              style={[styles.message, { color: modernTheme.textSecondary }]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <X size={18} color={modernTheme.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.titleSmall,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  message: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});

export default ModernToast;