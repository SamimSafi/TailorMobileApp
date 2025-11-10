# Repository Overview

## Tech Stack
- **Framework**: React Native with Expo
- **Language**: JavaScript/TypeScript hybrid (JS dominant)
- **State Management**: Zustand stores (`useCustomerStore`, `useSearchStore`, etc.)
- **Navigation**: React Navigation
- **Styling**: React Native StyleSheet with custom theme helpers under `src/theme`

## Key Directories
- **src/components**: Shared UI components including modernized variants
- **src/screens**: Screen-level containers (e.g., `SearchScreenModern`)
- **src/hooks**: Custom hooks for animation, responsiveness, etc.
- **src/store**: Zustand store definitions for app state
- **src/utils**: Utility helpers (storage, validators, toast manager)

## Animations
- Uses React Native `Animated` API with emphasis on `useNativeDriver: true`
- Custom hooks like `useFadeIn` centralize animation patterns

## Known Issues / Watchpoints
- Mixed native/JS animation drivers can trigger runtime errors if not consistent
- Some components rely on Expo Camera barcode settings; ensure configuration uses enum values over raw strings

## Best Practices
- Keep animation drivers consistent across a shared `Animated.Value`
- Use theme constants (`enhancedTheme`) for spacing, color, and typography
- Validate user inputs before triggering store mutations or API calls