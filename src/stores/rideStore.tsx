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
}

// 🔹 Define the type for the store
interface RideStore {
  rideData: Record<string, any>;
  rideRequests: Ride[];

  setRideData: (data: Record<string, any>) => void;

  // ✅ Allow both a function updater or direct array/object
  setRideRequests: (updater: Ride | ((prev: Ride[]) => Ride[])) => void;

  clearRideRequests: () => void;
}

// 🔹 Create Zustand store
export const useRideStore = create<RideStore>(set => ({
  rideData: {},
  rideRequests: [],

  setRideData: data => set({ rideData: data }),

 setRideRequests: updater => {
  if (typeof updater === 'function') {
    // Functional update
    set(state => ({
      rideRequests: updater(state.rideRequests),
    }));
  } else if (typeof updater === 'string') {
    // If updater is an id (string), remove the ride with that id
    set(state => ({
      rideRequests: state.rideRequests.filter(
        ride => ride.id !== updater && ride._id !== updater
      ),
    }));
  } else {
    // If updater is an object (single ride)
    set(state => {
      const exists = state.rideRequests.some(
        ride => ride.id === updater.id || ride._id === updater._id
      );

      return exists
        ? state // no change if already exists
        : { rideRequests: [updater, ...state.rideRequests] };
    });
  }
},


  clearRideRequests: () => set({ rideRequests: [], rideData: {} }),
}));
