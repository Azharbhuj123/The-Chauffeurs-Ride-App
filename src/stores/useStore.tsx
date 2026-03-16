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
  vehicleData: LocationState | null;
  setForgotTrue: () => void;
  resetForgotTrue: () => void;
  setLocation: (loc: LocationState) => void;
  


  setVehicleData: (data: any) => void; // append new entry
}

export const useStore = create<AppState>((set) => ({
  isForgot: false,
  location: null,
  vehicleData: null,
  fcmToken: undefined,

  setForgotTrue: () => set({ isForgot: true }),
  resetForgotTrue: () => set({ isForgot: false }),
  setFcmToken: (token) => set({ fcmToken: token }),
  setVehicleData: (values) =>
    set((state) => ({ vehicleData: { ...state.vehicleData, ...values } })), // merge!
  setLocation: (loc) => set({ location: loc }),
}));
