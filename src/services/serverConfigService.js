import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateApiBaseUrl } from './api';

const SERVER_CONFIG_KEYS = {
  IP: 'SERVER_IP',
  PORT: 'SERVER_PORT',
  URL: 'SERVER_URL',
  SETUP_COMPLETE: 'SERVER_SETUP_COMPLETE',
};

/**
 * Save server configuration
 * @param {string} ip - Server IP address or hostname
 * @param {string} port - Server port number
 */
export const saveServerConfig = async (ip, port) => {
  try {
    const serverUrl = `http://${ip}:${port}/api`;

    await AsyncStorage.multiSet([
      [SERVER_CONFIG_KEYS.IP, ip],
      [SERVER_CONFIG_KEYS.PORT, port],
      [SERVER_CONFIG_KEYS.URL, serverUrl],
      [SERVER_CONFIG_KEYS.SETUP_COMPLETE, 'true'],
    ]);

    // Update the API client with the new URL
    updateApiBaseUrl(serverUrl);

    console.log('Server configuration saved:', serverUrl);
    return { success: true, url: serverUrl };
  } catch (error) {
    console.error('Error saving server configuration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current server configuration
 */
export const getServerConfig = async () => {
  try {
    const [ip, port, url, setupComplete] = await AsyncStorage.multiGet([
      SERVER_CONFIG_KEYS.IP,
      SERVER_CONFIG_KEYS.PORT,
      SERVER_CONFIG_KEYS.URL,
      SERVER_CONFIG_KEYS.SETUP_COMPLETE,
    ]);

    return {
      ip: ip[1],
      port: port[1],
      url: url[1],
      isSetupComplete: setupComplete[1] === 'true',
    };
  } catch (error) {
    console.error('Error getting server configuration:', error);
    return {
      ip: null,
      port: null,
      url: null,
      isSetupComplete: false,
    };
  }
};

/**
 * Clear server configuration (reset to initial state)
 * This will require user to set up the server again
 */
export const clearServerConfig = async () => {
  try {
    await AsyncStorage.multiRemove([
      SERVER_CONFIG_KEYS.IP,
      SERVER_CONFIG_KEYS.PORT,
      SERVER_CONFIG_KEYS.URL,
      SERVER_CONFIG_KEYS.SETUP_COMPLETE,
    ]);

    console.log('Server configuration cleared');
    return { success: true };
  } catch (error) {
    console.error('Error clearing server configuration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if server configuration is complete
 */
export const isServerConfigComplete = async () => {
  try {
    const setupComplete = await AsyncStorage.getItem(SERVER_CONFIG_KEYS.SETUP_COMPLETE);
    return setupComplete === 'true';
  } catch (error) {
    console.error('Error checking server configuration status:', error);
    return false;
  }
};