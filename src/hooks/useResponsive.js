/**
 * useResponsive Hook
 * Provides responsive breakpoints and device-aware values
 * Enables adaptive layouts for different screen sizes
 */

import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // Breakpoints based on common device sizes
    const breakpoints = {
      small: 320,    // Small phones (e.g., iPhone SE)
      medium: 375,   // Standard phones (e.g., iPhone 12)
      large: 428,    // Large phones (e.g., iPhone 14 Plus)
      tablet: 768,   // Tablets
      desktop: 1024, // Desktop/large tablets
    };

    // Determine current breakpoint
    const isSmallPhone = width < breakpoints.medium;
    const isMediumPhone = width >= breakpoints.medium && width < breakpoints.large;
    const isLargePhone = width >= breakpoints.large && width < breakpoints.tablet;
    const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
    const isDesktop = width >= breakpoints.desktop;

    // Device orientation
    const isPortrait = height > width;
    const isLandscape = width > height;

    // Safe area ratios
    const aspectRatio = width / height;
    const screenRatio = Math.min(width, height) / Math.max(width, height);

    // Responsive multiplier (for scaling)
    const scale = width / 375; // Base scale at 375px

    // Adaptive spacing function
    const adaptiveSpacing = (base) => Math.round(base * scale);

    // Adaptive font size
    const adaptiveFontSize = (base) => Math.round(base * scale);

    // Column count for grids
    const columnCount = isDesktop ? 4 : isTablet ? 3 : isLargePhone ? 2 : 1;

    // Adaptive padding
    const screenPadding = isSmallPhone ? 12 : 16;
    const sectionMargin = isSmallPhone ? 12 : 16;

    // Navigation height adjustments
    const bottomNavHeight = 56 + (isSmallPhone ? 8 : 0);

    return {
      // Dimensions
      width,
      height,
      
      // Breakpoints
      breakpoints,
      
      // Device type checks
      isSmallPhone,
      isMediumPhone,
      isLargePhone,
      isTablet,
      isDesktop,
      isPhone: !isTablet && !isDesktop,
      
      // Orientation
      isPortrait,
      isLandscape,
      
      // Ratios
      aspectRatio,
      screenRatio,
      scale,
      
      // Adaptive functions
      adaptiveSpacing,
      adaptiveFontSize,
      
      // Layout helpers
      columnCount,
      screenPadding,
      sectionMargin,
      bottomNavHeight,
      
      // Platform detection
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
      isWeb: Platform.OS === 'web',
    };
  }, [width, height]);
};

/**
 * Helper hook to get responsive values
 * @param smallValue - Value for small phones
 * @param mediumValue - Value for medium phones
 * @param largeValue - Value for large phones
 * @param tabletValue - Value for tablets
 * @returns The appropriate value based on screen size
 */
export const useResponsiveValue = (smallValue, mediumValue, largeValue, tabletValue) => {
  const { isSmallPhone, isMediumPhone, isLargePhone, isTablet } = useResponsive();

  if (isTablet) return tabletValue ?? largeValue ?? mediumValue ?? smallValue;
  if (isLargePhone) return largeValue ?? mediumValue ?? smallValue;
  if (isMediumPhone) return mediumValue ?? smallValue;
  return smallValue;
};

export default useResponsive;