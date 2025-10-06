import { create } from 'zustand'

// Define the state type
interface CounterState {
  isForgot: Boolean
   setForgotTrue: () => void
   resetForgotTrue: () => void

}

// Create the store
export const useStore = create<CounterState>((set) => ({
  isForgot: false,

  setForgotTrue :() => set((state) => ({ isForgot: true })),
  resetForgotTrue  : () =>set(()=> ({ isForgot: false }))



}))
