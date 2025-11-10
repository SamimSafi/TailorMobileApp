import { NativeBaseProvider } from 'native-base';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ModernToast from './components/ui/ModernToast';
import RootNavigator from './navigation/RootNavigator';
import { useLanguageStore } from './store/languageStore';

console.log('🚀 [STARTUP] App.js - Imports completed');

// Polyfill BackHandler.removeEventListener if it doesn't exist
// This handles cases where older code tries to use BackHandler.removeEventListener directly
if (BackHandler && typeof BackHandler.removeEventListener !== 'function') {
  BackHandler.removeEventListener = () => {
    console.warn('⚠️ BackHandler.removeEventListener called but not available');
  };
}

export default function App() {
  console.log('🚀 [STARTUP] App() - Rendering root component');

  // Initialize language from storage on app start
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        await useLanguageStore.getState().initializeLanguage();
        console.log('✓ Language system initialized');
      } catch (error) {
        console.error('Error initializing language:', error);
      }
    };

    initializeLanguage();
  }, []);
  
  return (
    <NativeBaseProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* <StatusBar barStyle="light-content" backgroundColor={modernTheme.primary} /> */}
        <RootNavigator />
        <ModernToast />
      </GestureHandlerRootView>
    </NativeBaseProvider>
  );
}

