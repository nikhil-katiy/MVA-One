import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Native: Expo SecureStore
const nativeStorage = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },

  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// Web: browser localStorage
const webStorage = {
  getItem: async (key: string) => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  setItem: async (key: string, value: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  },

  removeItem: async (key: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage:
        Platform.OS === "web"
          ? webStorage
          : nativeStorage,

      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);