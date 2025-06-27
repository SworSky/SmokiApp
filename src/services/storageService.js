import { Platform } from 'react-native';

let storage;

if (Platform.OS === 'web') {
  // Web storage using localStorage
  storage = {
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage error:', error);
      }
    },
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage error:', error);
        return null;
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage error:', error);
      }
    }
  };
} else {
  // Native storage using AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

export default storage;
