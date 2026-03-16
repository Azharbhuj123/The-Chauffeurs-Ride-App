import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type Role = 'User' | 'Driver' | 'Admin' | '';

interface CounterState {
  isForgot: boolean;
  hydrated: boolean;
  role: Role;
  token: string | null;
  userData: string | null;
  setForgotTrue: () => void;
  resetForgotTrue: () => void;
  setRole: (newRole: Role) => void;
  setUserData: (user: string, token: string) => Promise<void>;
  loadStoredData: () => Promise<void>;
  resetAll: () => Promise<void>;
  fcmToken?: string;
  setFcmToken: (data: any) => void; // append new entry
}

export const useUserStore = create<CounterState>(set => ({
  isForgot: false,
  role: '',
  token: null,
  userData: null,
  hydrated: false,
  fcmToken: undefined,

  setForgotTrue: () => set({ isForgot: true }),
  resetForgotTrue: () => set({ isForgot: false }),
  setRole: newRole => set({ role: newRole }),
  setFcmToken: token => set({ fcmToken: token }),

  // ✅ Save to async storage + state
  setUserData: async (user, token) => {
    try {
      // Always store user data
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // If a new token is provided, overwrite it; otherwise, keep existing token

      await AsyncStorage.setItem('token', token);

      // Update Zustand state
      set({ userData: user, token, role: user?.role });
    } catch (err) {
      console.error('Error setting user data:', err);
    }
  },

  // ✅ Load values from async storage on app start
  loadStoredData: async () => {
    const storedUser = await AsyncStorage.getItem('userData');
    const storedToken = await AsyncStorage.getItem('token');
    const parse_user = JSON.parse(storedUser);
    set({
      userData: storedUser ? parse_user : null,
      token: storedToken || null,
      role: parse_user?.role || '',
      hydrated: true, // ✅ finished loading
    });
  },

  resetAll: async () => {
    try {
      await AsyncStorage.multiRemove(['userData', 'token']); // clear both keys

      set({
        isForgot: false,
        role: '',
        token: null,
        userData: null,
        hydrated: false,
        fcmToken: undefined,
      });
    } catch (err) {
      console.error('Error resetting store:', err);
    }
  },
}));
