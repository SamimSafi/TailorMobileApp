/**
 * ENHANCED DESIGN SYSTEM
 * Professional, Production-Ready Theme with Premium Visual Design
 * Based on Material Design 3 + Custom Tailor App Requirements
 */

// ============================================================================
// COLOR SYSTEM - Comprehensive Palette with Semantic Colors
// ============================================================================

export const colors = {
  // Primary Colors (Professiol Blue - Trust & Reliability)
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  primaryLighter: '#eff6ff',
  primaryDark: '#1e40af',
  primaryDarker: '#1e3a8a',

  // Secondary Colors (Warm Amber - Actions & Warmth)
  secondary: '#f59e0b',
  secondaryLight: '#fef3c7',
  secondaryLighter: '#fffbeb',
  secondaryDark: '#d97706',
  secondaryDarker: '#b45309',

  // Semantic Success (Emerald - Positive & Complete)
  success: '#10b981',
  successLight: '#d1fae5',
  successLighter: '#f0fdf4',
  successDark: '#059669',

  // Semantic Error (Coral - Warnings & Errors)
  error: '#ef4444',
  errorLight: '#fee2e2',
  errorLighter: '#fef2f2',
  errorDark: '#dc2626',

  // Semantic Warning (Amber - Attention Needed)
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',

  // Semantic Info (Sky Blue - Information)
  info: '#0ea5e9',
  infoLight: '#e0f2fe',
  infoDark: '#0284c7',

  // Neutral Grayscale (Professional & Clean)
  neutral50: '#f8fafc',    // Ultra light backgrounds
  neutral100: '#f1f5f9',   // Light backgrounds
  neutral200: '#e2e8f0',   // Light borders, dividers
  neutral300: '#cbd5e1',   // Hover states
  neutral400: '#94a3b8',   // Secondary text
  neutral500: '#64748b',   // Tertiary text
  neutral600: '#475569',   // Primary text
  neutral700: '#334155',   // Dark text
  neutral800: '#1e293b',   // Very dark text
  neutral900: '#0f172a',   // Almost black

  // Semantic Aliases
  background: '#f8fafc',   // Page background
  surface: '#ffffff',      // Card/component surfaces
  surfaceVariant: '#f1f5f9',
  border: '#e2e8f0',
  divider: '#f1f5f9',
  
  // Text Colors (with proper contrast)
  text: '#1e293b',         // Primary text (navy-ish)
  textSecondary: '#64748b', // Secondary text (gray)
  textTertiary: '#94a3b8',  // Tertiary text (lighter gray)
  textInverse: '#ffffff',   // Text on dark backgrounds
  textMuted: '#cbd5e1',     // Disabled/muted text
  
  // Disabled States
  disabled: '#e2e8f0',
  disabledText: '#cbd5e1',

  // Feedback Colors
  success_bg: '#ecfdf5',    // Success backgrounds
  error_bg: '#fef2f2',      // Error backgrounds
  warning_bg: '#fffbeb',    // Warning backgrounds
  info_bg: '#f0f9ff',       // Info backgrounds
};

// ============================================================================
// ELEVATION & SHADOW SYSTEM - Professional Depth
// ============================================================================

export const shadows = {
  // Level 0: No shadow (flat/background)
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Level 1: Subtle shadows for cards and interactive elements
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  // Level 2: Moderate shadows for floating elements
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  // Level 3: Prominent shadows for modals and bottom sheets
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  // Level 4: Extra emphasis for dialogs and pop-ups
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 12,
  },
};

// ============================================================================
// SPACING SCALE - 8px Base Unit System
// ============================================================================

export const spacing = {
  // Micro spacing (1/4 units)
  0: 0,
  xs: 4,    // Tight spacing between elements
  sm: 8,    // Element padding, small gaps
  md: 12,   // Medium gaps, default padding
  lg: 16,   // Large gaps, standard section margin
  xl: 20,   // Extra large gaps
  xxl: 24,  // Double extra large
  xxxl: 32, // Triple extra large
  xxxxl: 48,// Quad extra large - major section spacing
};

// ============================================================================
// TYPOGRAPHY SYSTEM - Professional Hierarchy
// ============================================================================

export const typography = {
  // Display Sizes (Major Headlines)
  displayLarge: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0,
  },

  // Headline Sizes (Section Titles)
  headlineLarge: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  headlineSmall: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Title Sizes (Card/Component Titles)
  titleLarge: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body Sizes (Main Content)
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Label Sizes (Buttons, Labels, Captions)
  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Caption (Helper text, hints)
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

// ============================================================================
// BORDER RADIUS SCALE - Consistent Rounded Corners
// ============================================================================

export const borderRadius = {
  none: 0,      // Sharp corners
  xs: 4,        // Extra small (inputs, small components)
  sm: 8,        // Small (chips, small cards)
  md: 12,       // Medium (cards, buttons)
  lg: 16,       // Large (larger cards, modals)
  xl: 20,       // Extra large
  full: 9999,   // Fully rounded (circles, pills)
};

// ============================================================================
// COMPONENT SPACING - Predefined Component Layouts
// ============================================================================

export const componentSpacing = {
  // Button heights
  buttonHeightSmall: 32,
  buttonHeightMedium: 40,
  buttonHeightLarge: 48,

  // Input heights
  inputHeightSmall: 36,
  inputHeightMedium: 44,
  inputHeightLarge: 52,

  // Touch target minimum (accessibility)
  touchTargetMinimum: 44,

  // Container widths
  containerMaxWidth: 1200,
  containerPadding: spacing.lg, // 16px

  // Icon sizes
  iconSizeSmall: 16,
  iconSizeMedium: 24,
  iconSizeLarge: 32,
};

// ============================================================================
// ANIMATION TOKENS - Consistent Motion
// ============================================================================

export const animation = {
  // Duration timings
  fast: 150,     // Quick feedback (ripple, scale)
  normal: 300,   // Standard transitions
  slow: 500,     // Modal/drawer transitions
  verySlow: 800, // Complex animations

  // Easing functions (cubic-bezier values)
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
};

// ============================================================================
// COMBINED THEME EXPORT
// ============================================================================

export const enhancedTheme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  componentSpacing,
  animation,
};

export default enhancedTheme;