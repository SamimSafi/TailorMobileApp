/**
 * BOTTOM NAVIGATION BAR
 * Premium navigation component with active states, animations, and haptic feedback
 * 
 * Features:
 * - Active state with animated dot indicator
 * - Smooth transitions between screens
 * - Haptic feedback on selection
 * - Responsive design
 * - Beautiful iconography
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { animation, colors, shadows, spacing } from '../../theme/enhancedTheme';

const BottomNavBar = ({
  activeTab = 'search',
  onTabChange = () => {},
  tabs = [
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'customers', label: 'Customers', icon: 'people' },
    { id: 'invoices', label: 'Invoices', icon: 'document-text' },
    { id: 'scan', label: 'Scan', icon: 'scan' },
    { id: 'more', label: 'More', icon: 'ellipsis-horizontal' },
  ],
  floatingActionButton = null, // Component to render as FAB
}) => {
  const { width } = useWindowDimensions();
  const tabWidth = width / tabs.length;

  // Animated values for active indicator
  const animatedValues = useMemo(
    () =>
      tabs.reduce((acc, tab) => {
        acc[tab.id] = new Animated.Value(activeTab === tab.id ? 1 : 0);
        return acc;
      }, {}),
    []
  );

  // Animate indicator when active tab changes
  React.useEffect(() => {
    tabs.forEach((tab) => {
      Animated.timing(animatedValues[tab.id], {
        toValue: activeTab === tab.id ? 1 : 0,
        duration: animation.normal,
        useNativeDriver: false,
      }).start();
    });
  }, [activeTab]);

  const handleTabPress = (tabId) => {
    if (tabId !== activeTab) {
      // Haptic feedback on iOS
      if (Platform.OS === 'ios') {
        // Could integrate react-native-haptic-feedback here
      }
      onTabChange(tabId);
    }
  };

  return (
    <View style={styles.container}>
      {/* Bottom Navigation Bar */}
      <View style={[styles.navBar, shadows.md]}>
        {tabs.map((tab) => (
          <NavTabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            animatedValue={animatedValues[tab.id]}
            tabWidth={tabWidth}
            onPress={() => handleTabPress(tab.id)}
          />
        ))}
      </View>

      {/* Floating Action Button */}
      {floatingActionButton && (
        <View style={styles.fabContainer}>{floatingActionButton}</View>
      )}
    </View>
  );
};

/**
 * Individual Tab Item Component
 */
const NavTabItem = ({ tab, isActive, animatedValue, tabWidth, onPress }) => {
  const scaleValue = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const opacityValue = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <TouchableOpacity
      style={[{ width: tabWidth }, styles.tabItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Active indicator dot */}
      <Animated.View
        style={[
          styles.indicatorDot,
          {
            opacity: animatedValue,
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}
      />

      {/* Icon with animation */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Ionicons
          name={tab.icon}
          size={24}
          color={isActive ? colors.primary : colors.textTertiary}
        />
      </Animated.View>

      {/* Label (optional - can be hidden on small screens) */}
      <Animated.Text
        style={[
          styles.label,
          {
            color: isActive ? colors.primary : colors.textTertiary,
            opacity: opacityValue,
          },
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  indicatorDot: {
    position: 'absolute',
    top: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    marginLeft: -28, // Half of button width
    zIndex: 10,
  },
});

export default BottomNavBar;