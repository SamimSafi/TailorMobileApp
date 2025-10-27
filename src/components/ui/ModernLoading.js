import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { modernTheme, spacing, typography } from '../../theme/modernTheme';

const ModernLoading = ({
  visible = true,
  fullscreen = false,
  message,
  size = 'large',
  color = modernTheme.primary,
}) => {
  if (!visible) return null;

  const content = (
    <View style={styles.centered}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.message, { color: modernTheme.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullscreen) {
    return (
      <View style={[styles.container, styles.fullscreen]}>
        {content}
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 1000,
  },
  centered: {
    alignItems: 'center',
  },
  message: {
    ...typography.bodySmall,
    marginTop: spacing.md,
  },
});

export default ModernLoading;