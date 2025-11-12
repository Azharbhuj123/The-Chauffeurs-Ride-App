import { create } from 'zustand';

// 🔹 Define the type for one ride item
export interface Ride {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  distance: string;
  price: string;
  ride_status: string;
  userName: string;
  payment_method: string;
  vehicle_type: string;
  hasUnreadMessages: boolean;
}

// 🔹 Define the type for the store
interface RideStore {
  rideData: Record<string, any>;
  rideRequests: Ride[];
  rideId: string | null;
  hasUnreadMessages: boolean;

  setRideData: (data: Record<string, any>) => void;
  setRideId: (id: string) => void;
  sethasUnreadMessages: (hasUnreadMessages: boolean) => void;
  
  setRideRequests: (
    updater: Ride | string | ((prev: Ride[]) => Ride[])
  ) => void;

  clearRideRequests: () => void;
}

// 🔹 Create Zustand store
export const useRideStore = create<RideStore>(set => ({
  rideData: {},
  rideRequests: [],
  rideId: null,
  hasUnreadMessages: false,

  setRideData: data => set(state => ({ rideData: { ...state.rideData, ...data } })),
  
  setRideId: id => set({ rideId: id }),
  
  sethasUnreadMessages: hasUnreadMessages => set({ hasUnreadMessages }),

  setRideRequests: updater => {
    if (typeof updater === 'function') {
      set(state => ({
        rideRequests: updater(state.rideRequests),
      }));
    } else if (typeof updater === 'string') {
      set(state => ({
        rideRequests: state.rideRequests.filter(
          ride => ride.id !== updater
        ),
      }));
    } else {
      set(state => {
        const exists = state.rideRequests.some(
          ride => ride.id === updater.id
        );
        return exists
          ? state
          : { rideRequests: [updater, ...state.rideRequests] };
      });
    }
  },

  clearRideRequests: () => set({ rideRequests: [], rideData: {} }),
}));
