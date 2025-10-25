import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { forceReinitializeApiClient, initializeApiClient } from '../services/api';
import { colors } from '../theme/colors';

import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';
import SearchScreen from '../screens/SearchScreen';
import ServerSetupScreen from '../screens/ServerSetupScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [setupComplete, setSetupComplete] = useState(null); // null = loading, true/false = loaded

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        // Initialize API client with stored configuration
        await initializeApiClient();

        // Check if server setup is complete
        const isSetupComplete = await AsyncStorage.getItem('SERVER_SETUP_COMPLETE');
        setSetupComplete(isSetupComplete === 'true');
      } catch (error) {
        console.error('Error checking setup status:', error);
        setSetupComplete(false); // Default to showing setup screen on error
      }
    };

    checkSetupStatus();
  }, []);

  const handleSetupComplete = async () => {
    try {
      // Force reinitialize API client with the newly configured URL
      const success = await forceReinitializeApiClient();
      if (success) {
        console.log('✓ Setup completed successfully, API initialized');
        setSetupComplete(true);
      } else {
        console.error('✗ Setup failed - API not initialized');
      }
    } catch (error) {
      console.error('✗ Error during setup completion:', error);
    }
  };

  // Show nothing while loading
  if (setupComplete === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {!setupComplete ? (
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
        ) : (
          <>
            <Stack.Screen
              name="Search"
              component={SearchScreen}
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

