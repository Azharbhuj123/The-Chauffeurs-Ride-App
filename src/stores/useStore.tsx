import { create } from 'zustand';

// Define the state type
type Role = 'user' | 'driver' | 'admin';

interface CounterState {
  isForgot: boolean;
  role: Role;
  setForgotTrue: () => void;
  resetForgotTrue: () => void;
  setRole: (newRole: Role) => void;
}


// Create the store
export const useStore = create<CounterState>((set) => ({
  isForgot: false,
  role: 'user',

  setForgotTrue: () => set({ isForgot: true }),
  resetForgotTrue: () => set({ isForgot: false }),
  setRole: (newRole) => set({ role: newRole }),
}));

