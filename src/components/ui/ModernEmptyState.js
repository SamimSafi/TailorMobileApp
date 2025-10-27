import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { modernTheme, spacing, typography } from '../../theme/modernTheme';
import ModernButton from './ModernButton';

const ModernEmptyState = ({
  icon,
  title,
  description,
  actionButton,
  actionText,
  onActionPress,
  style,
  iconSize = 64,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {React.cloneElement(icon, { size: iconSize })}
        </View>
      )}

      {title && <Text style={styles.title}>{title}</Text>}

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {(actionButton || (actionText && onActionPress)) && (
        <View style={styles.actionContainer}>
          {actionButton ? (
            actionButton
          ) : (
            <ModernButton
              text={actionText}
              onPress={onActionPress}
              variant="primary"
              size="md"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  title: {
    ...typography.headlineMedium,
    color: modernTheme.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMedium,
    color: modernTheme.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: spacing.lg,
    width: '100%',
  },
});

export default ModernEmptyState;