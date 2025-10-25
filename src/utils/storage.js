import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  },

  getItem: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Specific storage functions
  saveToken: async (token) => {
    await storage.setItem('token', token);
  },

  getToken: async () => {
    return await storage.getItem('token');
  },

  saveSearchHistory: async (history) => {
    await storage.setItem('searchHistory', history);
  },

  getSearchHistory: async () => {
    return (await storage.getItem('searchHistory')) || [];
  },

  addToSearchHistory: async (item) => {
    const history = await storage.getSearchHistory();
    const filtered = history.filter((h) => h.id !== item.id);
    const newHistory = [item, ...filtered].slice(0, 10); // Keep last 10
    await storage.saveSearchHistory(newHistory);
  },
};

