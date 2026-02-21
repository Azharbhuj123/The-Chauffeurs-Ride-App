/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import FlashMessage from 'react-native-flash-message';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { COLORS } from './src/utils/Enums';
import AppLoader from './src/components/AppLoader';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
// import Geolocation from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';

import { useStore } from './src/stores/useStore';
import { joinUserRoom, socket } from './src/utils/socket';
import { useUserStore } from './src/stores/useUserStore';
import { initSocketListeners } from './src/utils/socketEvents';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from './src/utils/NavigationService';
import { useRideStore } from './src/stores/rideStore';
import MainNavigation from './src/navigation/mainNavigation';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { setLocation } = useStore();
  const { userData, role } = useUserStore();
  const queryClient = new QueryClient();
  const { rideId } = useRideStore(); // get latest rideId
  const rideIdRef = useRef(rideId);

  // Update ref whenever rideId changes
  const [permissionStatus, setPermissionStatus] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);

  // Toast configuration
  const toastConfig = {
    success: props => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#000',

          backgroundColor: '#fff',
          marginTop: Platform.OS === 'ios' ? hp(3) : 2,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: COLORS.success,
          fontFamily: 'Poppins-Regular',
        }}
        text2Style={{
          fontSize: 14,
          color: '#555',
          fontFamily: 'Poppins-Regular',
        }}
      />
    ),
    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: COLORS.error,
          backgroundColor: '#fff',
          fontFamily: 'Poppins-Regular',
          marginTop: Platform.OS === 'ios' ? hp(3) : 2,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: COLORS.error,
          fontFamily: 'Poppins-Regular',
        }}
        text2Style={{
          fontSize: 14,
          color: '#555',
          fontFamily: 'Poppins-Regular',
        }}
      />
    ),
  };

  useEffect(() => {
    rideIdRef.current = rideId;
  }, [rideId]);
  // Socket & user room initialization
  useEffect(() => {
    if (userData?._id) {
      joinUserRoom(userData._id);
      initSocketListeners(role);
    }
  }, [userData?._id]);

  // Request location permissions (foreground + background)
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Step 1: Request "When In Use" permission first
        const whenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        console.log('When In Use:', whenInUse);

        if (whenInUse === RESULTS.GRANTED) {
          // Step 2: Then request "Always" permission
          const always = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
          console.log('Always permission:', always);

          setPermissionStatus(always);

          // Start tracking once we have any permission
          if (always === RESULTS.GRANTED || whenInUse === RESULTS.GRANTED) {
            startLocationTracking();
          }
        } else {
          console.warn('Location permission not granted.');
        }
      } else {
        // Android flow
        const fine = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const background = await request(
          PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        );

        console.log('Fine location:', fine);
        console.log('Background location:', background);

        setPermissionStatus(fine);
        if (fine === RESULTS.GRANTED) startLocationTracking();
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  // Check permission on app start
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Track user location continuously
  const startLocationTracking = () => {
    Geolocation.watchPosition(
      position => {
        console.log('User location:', position.coords);
        setLocation(position.coords);

        if (userData?._id) {
          socket.emit('user-location', {
            userId: userData._id.toString(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      },
      error => console.error('Location watch error:', error),
      {
        enableHighAccuracy: true, // Use GPS for precise location
        distanceFilter: 5, // Trigger update only if user moves 5 meters
        interval: 5000, // Android: attempt update every 2 sec
        fastestInterval: 1000, // Android: min interval 1 sec
        forceRequestLocation: true, // Force location fetch
        useSignificantChanges: false, // iOS: ignore only significant changes
      },
    );
  };

  // Optional: handle app state changes (pause/resume tracking)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
      if (nextAppState === 'active' && permissionStatus === RESULTS.GRANTED) {
        startLocationTracking();
      }
    });
    return () => subscription.remove();
  }, [permissionStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <MainNavigation />
        <Toast config={toastConfig} />
        <FlashMessage position="top" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
