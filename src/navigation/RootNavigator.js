import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { forceReinitializeApiClient, initializeApiClient } from '../services/api';
import CreateInvoiceScreen from './../screens/CreateInvoiceScreen';
import CustomerDetailsScreen from './../screens/CustomerDetailsScreen';
import LanguageSelectionScreen from './../screens/LanguageSelectionScreen';
import SearchScreenModern from './../screens/SearchScreenModern';
import ServerSetupScreen from './../screens/ServerSetupScreen';
import enhancedTheme from './../theme/enhancedTheme';

console.log('🚀 [STARTUP] RootNavigator.js - Imports completed');

const Stack = createNativeStackNavigator();

console.log('🚀 [STARTUP] RootNavigator.js - Stack navigator created');

const RootNavigator = () => {
  console.log('🚀 [STARTUP] RootNavigator component rendered');
  const [setupComplete, setSetupComplete] = useState(null); // null = loading, true/false = loaded

  useEffect(() => {
    console.log('🚀 [STARTUP] RootNavigator - useEffect hook running');
    
    const checkSetupStatus = async () => {
      try {
        console.log('🚀 [STARTUP] RootNavigator - Starting setup check...');
        
        // Initialize API client with stored configuration
        console.log('🚀 [STARTUP] RootNavigator - Initializing API client...');
        await initializeApiClient();
        console.log('✅ [STARTUP] RootNavigator - API client initialized successfully');

        // Check if server setup is complete
        console.log('🚀 [STARTUP] RootNavigator - Checking AsyncStorage for SERVER_SETUP_COMPLETE...');
        const isSetupComplete = await AsyncStorage.getItem('SERVER_SETUP_COMPLETE');
        console.log('✅ [STARTUP] RootNavigator - AsyncStorage check complete. Value:', isSetupComplete);
        
        setSetupComplete(isSetupComplete === 'true');
        console.log('✅ [STARTUP] RootNavigator - setupComplete state set to:', isSetupComplete === 'true');
      } catch (error) {
        console.error('❌ [STARTUP] RootNavigator - Error checking setup status:', error);
        setSetupComplete(false); // Default to showing setup screen on error
      }
    };

    checkSetupStatus();
  }, []);

  const handleSetupComplete = async () => {
    try {
      console.log('🚀 [STARTUP] RootNavigator - handleSetupComplete called');
      // Force reinitialize API client with the newly configured URL
      console.log('🚀 [STARTUP] RootNavigator - Reinitializing API client...');
      const success = await forceReinitializeApiClient();
      if (success) {
        console.log('✅ [STARTUP] Setup completed successfully, API initialized');
        setSetupComplete(true);
      } else {
        console.error('❌ [STARTUP] Setup failed - API not initialized');
      }
    } catch (error) {
      console.error('❌ [STARTUP] Error during setup completion:', error);
    }
  };

  // Show nothing while loading
  if (setupComplete === null) {
    console.log('🚀 [STARTUP] RootNavigator - Still loading, returning null');
    return null;
  }
  
  console.log('🚀 [STARTUP] RootNavigator - Rendering navigation with setupComplete:', setupComplete);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: enhancedTheme.colors.background },
          animationEnabled: true,
        }}
      >
        {setupComplete === false && (
          <Stack.Screen
            name="ServerSetup"
            children={({ navigation }) => (
              <ServerSetupScreen
                onSetupComplete={() => {
                  handleSetupComplete();
                }}
              />
            )}
            options={{
              animationEnabled: false,
              gestureEnabled: false,
            }}
          />
        )}
        {setupComplete === true && (
          <>
            <Stack.Screen
              name="Search"
              component={SearchScreenModern}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="CustomerDetails"
              component={CustomerDetailsScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="CreateInvoice"
              component={CreateInvoiceScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="LanguageSelection"
              component={LanguageSelectionScreen}
              options={{
                animationEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

