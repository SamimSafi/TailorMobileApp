/**
 * ENHANCED CUSTOMER CARD
 * Premium customer list item with:
 * - Avatar with customer initials
 * - Quick action buttons (call, message, view)
 * - Balance indicator with color coding
 * - Address display
 * - Swipe actions (optional)
 * - Responsive design
 */

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../theme/enhancedTheme';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

const CustomerCardEnhanced = ({
  customer = {},
  onPress = () => {},
  onCall = () => {},
  onMessage = () => {},
  onEdit = () => {},
  showActions = true,
}) => {
  // Extract data matching the original structure
  const name = customer.customerName || 'Unknown Customer';
  const phone = customer.phoneNumber || '';
  const address = customer.address || '';
  const balance = customer.balance || 0;
  const avatar = customer.avatar || null;

  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe actions - adjusted to not interfere with taps
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if horizontal movement is dominant and exceeds threshold
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 2;
      },
      onPanResponderGrant: () => {
        // Optional: handle grant if needed
      },
      onPanResponderMove: (evt, { dx }) => {
        if (dx < 0) {
          // Swiping left
          swipeAnim.setValue(Math.min(Math.abs(dx), 120) / 120);
        } else {
          // Optional: handle right swipe to reset or partial reveal
          swipeAnim.setValue(Math.max(0, dx / 120));
        }
      },
      onPanResponderRelease: (evt, { dx }) => {
        if (dx < -50) {
          // Reveal actions
          Animated.timing(swipeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          // Hide actions
          Animated.timing(swipeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Format balance color (improved logic: positive balance = owes = warning/error)
  const getBalanceColor = (balance) => {
    if (balance > 1000) return colors.error; // High debt
    if (balance > 500) return colors.warning; // Medium debt
    if (balance > 0) return colors.warning; // Small debt (changed from info for consistency)
    return colors.success; // Paid up or credit
  };

  // Avatar initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const translateX = swipeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  return (
    <View style={styles.container}>
      {/* Swipe Actions Background */}
      <View style={styles.swipeActionsBackground}>
        <TouchableOpacity style={styles.swipeAction} onPress={onCall}>
          <Ionicons name="call" size={20} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.swipeAction} onPress={onMessage}>
          <Ionicons name="mail" size={20} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.swipeActionDelete]}
          onPress={onEdit}
        >
          <Ionicons name="trash" size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Card Content */}
      <Animated.View
        style={[
          styles.cardContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateX },
            ],
          },
          shadows.sm,
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          {/* Customer Info */}
          <View style={styles.infoContainer}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {avatar ? (
                avatar
              ) : (
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
              )}
            </View>

            {/* Name, Phone, and Address */}
            <View style={styles.customerDetails}>
              <Text style={styles.customerName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.customerPhone} numberOfLines={1}>
                {formatPhoneNumber(phone) || 'No phone'}
              </Text>
              {address && (
                <Text style={styles.addressText} numberOfLines={1}>
                  {address}
                </Text>
              )}
            </View>
          </View>

          {/* Balance and Actions */}
          <View style={styles.rightSection}>
            {/* Balance */}
            <View
              style={[
                styles.balanceBadge,
                { backgroundColor: `${getBalanceColor(balance)}10` },
              ]}
            >
              <Text
                style={[
                  styles.balanceText,
                  { color: getBalanceColor(balance) },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>

            {/* Quick Actions */}
            {showActions && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onCall}
                >
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onMessage}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onPress}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    overflow: 'hidden',
    borderRadius: borderRadius.md,
  },
  swipeActionsBackground: {
    flexDirection: 'row',
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  swipeActionDelete: {
    backgroundColor: colors.error,
  },
  cardContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  customerPhone: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textTertiary,
    fontWeight: '400',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  balanceBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: typography.labelMedium.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomerCardEnhanced;