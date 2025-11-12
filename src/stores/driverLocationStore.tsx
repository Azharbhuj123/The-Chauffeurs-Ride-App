// @ts-nocheck


import { create } from 'zustand';
import Geolocation from '@react-native-community/geolocation';
import { socket } from '../utils/socket';

export const useDriverLocationStore = create((set, get) => ({
  trackingId: null,
  startTracking: (rideId, driverId) => {
    if (!rideId || !driverId) {
      console.log(null, 'pos.coords');

      return;
    }
      console.log(null, 'pos.coords >> 2');

      

    const watchId = Geolocation.watchPosition(
      position => {
        console.log('User location:', position.coords);

        //   socket.emit('driver-location', {
        //   rideId,
        //   driverId,
        //   lat: latitude,
        //   lng: longitude,
        // });
    
      },
      err => console.log('Driver location error:', err),
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 2000,
        fastestInterval: 1000,
      },
    );
    set({ trackingId: watchId });
  },
  stopTracking: () => {
    const { trackingId } = get();
    if (trackingId !== null) Geolocation.clearWatch(trackingId);
    set({ trackingId: null });
  },
}));
