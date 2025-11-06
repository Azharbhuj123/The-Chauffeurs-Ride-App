// useLoaderStore.js
import { create } from 'zustand';

export const useRidestore = create(set => ({
  rideData: {},

  setRideData: (data: void) => set({ rideData: data }),
}));
