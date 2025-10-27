import { X } from 'lucide-react-native';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { modernTheme, radius, shadows, spacing, typography } from '../../theme/modernTheme';

const ModernModal = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // 'sm', 'md', 'lg', 'fullscreen'
  closeButton = true,
  animated = true,
  backdrop = true,
  backdropClosable = true,
}) => {
  const getSizeStyles = () => {
    const sizes = {
      sm: { width: '80%', maxHeight: '60%' },
      md: { width: '85%', maxHeight: '75%' },
      lg: { width: '90%', maxHeight: '85%' },
      fullscreen: { width: '100%', height: '100%' },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  return (
    <Modal
      visible={visible}
      transparent={backdrop}
      animationType={animated ? 'fade' : 'none'}
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      {backdrop && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={backdropClosable ? onClose : undefined}
          activeOpacity={backdropClosable ? 0.6 : 1}
        />
      )}

      {/* Modal Content */}
      <View
        style={[
          styles.container,
          size === 'fullscreen' ? styles.fullscreenContainer : styles.centeredContainer,
        ]}
      >
        <View
          style={[
            styles.modal,
            sizeStyles,
            size === 'fullscreen' && styles.fullscreenModal,
            shadows.medium,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {closeButton && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <X size={24} color={modernTheme.text} />
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullscreenContainer: {
    backgroundColor: modernTheme.white,
  },
  modal: {
    backgroundColor: modernTheme.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  fullscreenModal: {
    borderRadius: 0,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.headlineSmall,
    color: modernTheme.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
  },
  closeButton: {
    marginLeft: spacing.md,
    padding: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: modernTheme.divider,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});

export default ModernModal;