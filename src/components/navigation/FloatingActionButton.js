/**
 * FLOATING ACTION BUTTON (FAB)
 * Premium floating action button with multiple action options
 * 
 * Features:
 * - Context-aware actions
 * - Smooth animations
 * - Multiple action menu
 * - Haptic feedback
 * - Accessibility support
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { animation, colors, shadows, spacing } from '../../theme/enhancedTheme';

const FloatingActionButton = ({
  onPress = () => {},
  icon = 'add',
  iconSize = 28,
  size = 'large', // 'small' | 'medium' | 'large'
  variant = 'primary', // 'primary' | 'secondary' | 'success'
  actions = [], // Array of { icon, label, onPress }
  position = 'bottom-right', // Position on screen
  disabled = false,
  label = null, // Accessibility label
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  // Size configurations
  const sizeConfig = {
    small: { width: 40, height: 40, fontSize: 20 },
    medium: { width: 50, height: 50, fontSize: 24 },
    large: { width: 56, height: 56, fontSize: 28 },
  };
  const config = sizeConfig[size] ?? sizeConfig.large;

  // Color configurations
  const colorConfig = {
    primary: { bg: colors.primary, text: colors.surface },
    secondary: { bg: colors.secondary, text: colors.surface },
    success: { bg: colors.success, text: colors.surface },
  };
  const colorScheme = colorConfig[variant] ?? colorConfig.primary;

  const handlePress = () => {
    if (actions.length > 0) {
      toggleExpanded();
    } else {
      onPress();
      animatePressScale();
    }
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  const animatePressScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: animation.fast / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animation.fast / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const positionStyles = getPositionStyles(position, config.width);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Expanded Actions Menu */}
      {isExpanded && actions.length > 0 && (
        <ExpandedActionsMenu
          actions={actions}
          position={position}
          onActionPress={(action) => {
            action.onPress?.();
            setIsExpanded(false);
          }}
        />
      )}

      {/* Main FAB Button */}
      <Animated.View
        style={[
          styles.fabButton,
          {
            width: config.width,
            height: config.height,
            backgroundColor: colorScheme.bg,
            borderRadius: config.width / 2,
            transform: [{ scale: scaleAnim }],
            ...positionStyles,
          },
          shadows.lg,
        ]}
      >
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityLabel={label}
          accessibilityRole="button"
        >
          <Animated.View
            style={{
              transform: [{ rotate }],
            }}
          >
            <Ionicons
              name={icon}
              size={config.fontSize}
              color={colorScheme.text}
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

/**
 * Expanded Actions Menu Component
 */
const ExpandedActionsMenu = ({ actions, position, onActionPress }) => {
  const { width, height } = useWindowDimensions();
  const itemAnimations = useRef(
    actions.map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    const animations = actions.map((_, index) =>
      Animated.spring(itemAnimations[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View
      style={[
        styles.expandedContainer,
        getExpandedPositionStyles(position, width, height),
      ]}
    >
      {actions.map((action, index) => {
        const scale = itemAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        const opacity = itemAnimations[index];

        return (
          <Animated.View
            key={index}
            style={[
              styles.actionItem,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, shadows.md]}
              onPress={() => onActionPress(action)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
            {action.label && (
              <Text style={styles.actionLabel}>{action.label}</Text>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

// Helper function to get position styles
const getPositionStyles = (position, fabWidth) => {
  const margin = spacing.lg;
  const positions = {
    'bottom-right': {
      position: 'absolute',
      bottom: 80,
      right: margin,
    },
    'bottom-left': {
      position: 'absolute',
      bottom: 80,
      left: margin,
    },
    'top-right': {
      position: 'absolute',
      top: margin,
      right: margin,
    },
    'top-left': {
      position: 'absolute',
      top: margin,
      left: margin,
    },
  };
  return positions[position] || positions['bottom-right'];
};

// Helper function to get expanded menu position
const getExpandedPositionStyles = (position, screenWidth, screenHeight) => {
  const positions = {
    'bottom-right': {
      bottom: 120,
      right: spacing.lg,
    },
    'bottom-left': {
      bottom: 120,
      left: spacing.lg,
    },
    'top-right': {
      top: 120,
      right: spacing.lg,
    },
    'top-left': {
      top: 120,
      left: spacing.lg,
    },
  };
  return positions[position] || positions['bottom-right'];
};

const styles = StyleSheet.create({
  fabButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  touchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContainer: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 99,
  },
  actionItem: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});

export default FloatingActionButton;