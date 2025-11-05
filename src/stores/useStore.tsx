import { create } from 'zustand';

// Define your location type (customize if needed)
interface LocationState {
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

type Role = 'user' | 'driver' | 'admin';

interface AppState {
  isForgot: boolean;
  location: LocationState | null;
  setForgotTrue: () => void;
  resetForgotTrue: () => void;
  setLocation: (loc: LocationState) => void;
}

export const useStore = create<AppState>((set) => ({
  isForgot: false,
  location: null,

  setForgotTrue: () => set({ isForgot: true }),
  resetForgotTrue: () => set({ isForgot: false }),

  setLocation: (loc) => set({ location: loc }),
}));
