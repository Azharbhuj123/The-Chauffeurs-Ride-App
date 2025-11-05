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
}

export const useUserStore = create<CounterState>(set => ({
  isForgot: false,
  role: '',
  token: null,
  userData: null,
  hydrated: false,

  setForgotTrue: () => set({ isForgot: true }),
  resetForgotTrue: () => set({ isForgot: false }),
  setRole: newRole => set({ role: newRole }),

  // ✅ Save to async storage + state
  setUserData: async (user, token) => {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
    set({ userData: user, token, role: user?.role });
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
}));
