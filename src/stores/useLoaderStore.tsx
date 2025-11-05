// useLoaderStore.js
import { create } from "zustand";

export const useLoaderStore = create((set) => ({
  loading: false,
  showLoader: () => set({ loading: true }),
  hideLoader: () => set({ loading: false }),
}));
