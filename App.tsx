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
  PermissionsAndroid,
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

const queryClient = new QueryClient();


export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { setLocation } = useStore();
  const { userData, role, setFcmToken } = useUserStore();
  const { handleSuccess, handleRefresh } = useStripeStore();
  const { rideId } = useRideStore();
  
  const rideIdRef = useRef(rideId);
  const [permissionStatus, setPermissionStatus] = useState('');

  // 1. Toast Configuration
  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#000',
          backgroundColor: '#fff',
          marginTop: Platform.OS === 'ios' ? hp(3) : 2,
        }}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.success, fontFamily: 'Poppins-Regular' }}
        text2Style={{ fontSize: 14, color: '#555', fontFamily: 'Poppins-Regular' }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: COLORS.error,
          backgroundColor: '#fff',
          marginTop: Platform.OS === 'ios' ? hp(3) : 2,
        }}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.error, fontFamily: 'Poppins-Regular' }}
        text2Style={{ fontSize: 14, color: '#555', fontFamily: 'Poppins-Regular' }}
      />
    ),
  };

  // 2. Unified Initialization Logic
  useEffect(() => {
    const initApp = async () => {
      await handlePermissionsSequence();
      setupDeepLinks();
    };

    initApp();

    // Foreground Notification Listener
    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      showFlash({
        type: 'info',
        title: remoteMessage.notification?.title || 'New Notification',
        message: remoteMessage.notification?.body || '',
      });
    });

    return () => {
      unsubscribeFCM();
    };
  }, []);

  // 3. Sequential Permission Handler
  const handlePermissionsSequence = async () => {
    try {
      // --- Location Permissions ---
      const locPermission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const currentStatus = await check(locPermission);

      if (currentStatus === RESULTS.DENIED) {
        // First time asking
        await requestLocationPermission();
      } else if (currentStatus === RESULTS.GRANTED) {
        startLocationTracking();
      }

      // --- Notification Permissions ---
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasNotifyPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (!hasNotifyPerm) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
      } else if (Platform.OS === 'ios') {
        await messaging().requestPermission();
      }

      // --- Get FCM Token ---
      const token = await messaging().getToken();
      if (token) setFcmToken(token);

    } catch (err) {
      console.error('Initialization Error:', err);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const whenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (whenInUse === RESULTS.GRANTED) {
        await request(PERMISSIONS.IOS.LOCATION_ALWAYS); // Background permission
        startLocationTracking();
      }
    } else {
      const fine = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (fine === RESULTS.GRANTED) {
        setPermissionStatus(fine);
        startLocationTracking();
        // Request background separately for Android 11+ if needed
        await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      }
    }
  };

  const startLocationTracking = () => {
    Geolocation.watchPosition(
      position => {
        setLocation(position.coords);
        if (userData?._id) {
          socket.emit('user-location', {
            userId: userData._id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      },
      error => console.log('Location Error:', error),
      { enableHighAccuracy: true, distanceFilter: 5, interval: 5000, fastestInterval: 2000 }
    );
  };

  // 4. Socket & AppState Management
  useEffect(() => {
    if (userData?._id) {
      joinUserRoom(userData._id);
      initSocketListeners(role);
    }
  }, [userData?._id]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') startLocationTracking();
    });
    return () => subscription.remove();
  }, []);

  // 5. Deep Linking Logic
  const setupDeepLinks = () => {
    Linking.getInitialURL().then(url => url && handleDeepLink(url));
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  };

  const handleDeepLink = (url: string) => {
    const accountId = url.split('accountId=')?.split('&') ?? '';
    if (url.includes('stripe-connect-success')) handleSuccess(accountId);
    if (url.includes('stripe-connect-refresh')) handleRefresh(accountId);
  };

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
  container: { flex: 1 },
});
