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
  Alert,
  Linking,
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
import messaging from '@react-native-firebase/messaging';
import { useStore } from './src/stores/useStore';
import { joinUserRoom, socket } from './src/utils/socket';
import { useUserStore } from './src/stores/useUserStore';
import { initSocketListeners } from './src/utils/socketEvents';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from './src/utils/NavigationService';
import { useRideStore } from './src/stores/rideStore';
import MainNavigation from './src/navigation/mainNavigation';
import { showFlash } from './src/utils/flashMessageHelper';
import { useStripeStore } from './src/stores/stripeStore';
import StripeConnectModal from './src/components/StripeConnectModal';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { setLocation } = useStore();
  const { userData, role, setFcmToken } = useUserStore();
  const handleSuccess = useStripeStore(s => s.handleSuccess);
  const handleRefresh = useStripeStore(s => s.handleRefresh);
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
    console.log('Hermes:', !!global.HermesInternal);
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

  useEffect(() => {
    // 1️⃣ Request permission (Android 13+)
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission enabled');
        getToken();
      } else {
        console.log('Notification permission denied');
      }
    };

    requestPermission();

    // 2️⃣ Foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      showFlash({
        type: 'info',
        title: remoteMessage.notification?.title || 'New Notification',
        message: remoteMessage.notification?.body || '',
      });
    });

    return unsubscribe;
  }, []);

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setFcmToken(token);

      // ✅ TODO: Send token to your backend
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };

  useEffect(() => {
    // Handle deep link when app is launched cold (was closed)
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    // Handle deep link when app is already running in background
    const subscription = Linking.addEventListener('url', ({ url }) =>
      handleDeepLink(url),
    );

    return () => subscription.remove();
  }, []);

  function handleDeepLink(url: string) {
    if (!url) return;

    try {
      // React Native's URL parser needs a valid base for custom schemes
      const accountId = url.split('accountId=')[1]?.split('&')[0] ?? '';

      if (url.includes('stripe-connect-success')) {
        handleSuccess(accountId);
      } else if (url.includes('stripe-connect-refresh')) {
        handleRefresh(accountId);
      }
    } catch (err) {
      console.warn('[DeepLink] Failed to parse URL:', url, err);
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <MainNavigation />
        <Toast config={toastConfig} />
        <FlashMessage position="top" />
         <StripeConnectModal />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
