/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// App.tsx
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigation from './src/navigation/MainNavigation';
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
import Geolocation from 'react-native-geolocation-service';

import { useStore } from './src/stores/useStore';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { setLocation } = useStore();
  const queryClient = new QueryClient();

  const toastConfig = {
    success: props => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#000',
          backgroundColor: '#fff',
          marginTop: hp(3),
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
          marginTop: hp(3),
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
 
  const [permissionStatus, setPermissionStatus] = useState('');

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await request(permission);
    console.log('Permission result:', result);
    setPermissionStatus(result);

    if (result === RESULTS.GRANTED) {
      getUserLocation();
    }
  };

  useEffect(() => {
    requestLocationPermission().then(result => {
      console.log('Permission result:', result);
    });
  }, []);

  const getUserLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
 
        setLocation(position?.coords);
      },
      error => {
        console.log('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  useEffect(() => {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ).then(result => {
      setPermissionStatus(result);
      if (result === RESULTS.GRANTED) {
        getUserLocation();
      }
    });
  }, []);
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <MainNavigation />
        <Toast config={toastConfig} />
        <FlashMessage position="top" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
