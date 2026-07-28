import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CANTO_KEYS } from '@/constants';

const isWeb = Platform.OS === 'web';

const webStorage = {
  async getString(key: string): Promise<string | null> {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch (error) {
      console.error('Web storage get error:', error);
      return null;
    }
  },
  async setString(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Web storage set error:', error);
    }
  },
  async remove(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Web storage remove error:', error);
    }
  },
};

async function getString(key: string): Promise<string | null> {
  return isWeb ? webStorage.getString(key) : AsyncStorage.getItem(key);
}

async function setString(key: string, value: string): Promise<void> {
  return isWeb ? webStorage.setString(key, value) : AsyncStorage.setItem(key, value);
}

async function remove(key: string): Promise<void> {
  return isWeb ? webStorage.remove(key) : AsyncStorage.removeItem(key);
}

export const storage = {
  getString,
  setString,

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const str = await getString(key);
      return str ? (JSON.parse(str) as T) : null;
    } catch (error) {
      console.error('Storage getJSON error:', error);
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await setString(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setJSON error:', error);
    }
  },

  remove,

  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(CANTO_KEYS.storage);
      if (isWeb) {
        keys.forEach((k) => webStorage.remove(k));
      } else {
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('Storage clearAll error:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    return getString(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    return setString(key, value);
  },

  async removeItem(key: string): Promise<void> {
    return remove(key);
  },
};

export { CANTO_KEYS };
