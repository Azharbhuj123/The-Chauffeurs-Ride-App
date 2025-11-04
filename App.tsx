/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// App.tsx
import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigation from './src/navigation/MainNavigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import FlashMessage from 'react-native-flash-message';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const queryClient = new QueryClient();

  const toastConfig = {
    success: props => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#FDD835', backgroundColor: '#fff' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}
        text2Style={{ fontSize: 14, color: '#555' }}
      />
    ),

    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: 'red',
          backgroundColor: '#fff',
          fontFamily: 'Poppins-Regular',
          marginTop: hp(3)
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: 'red',
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
