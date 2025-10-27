import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ModernToast from './components/ui/ModernToast';
import RootNavigator from './navigation/RootNavigator';
import { modernTheme } from './theme/modernTheme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={modernTheme.primary} />
      <RootNavigator />
      <ModernToast />
    </GestureHandlerRootView>
  );
}

