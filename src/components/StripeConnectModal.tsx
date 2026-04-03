import React, { useCallback, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet, Platform, StatusBar,
} from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { useStripeStore } from '../stores/stripeStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StripeConnectModal() {
  const webViewRef = useRef<WebView>(null);
  const connectState  = useStripeStore(s => s.connectState);
  const handleSuccess = useStripeStore(s => s.handleSuccess);
  const handleRefresh = useStripeStore(s => s.handleRefresh);
  const reset         = useStripeStore(s => s.reset);

  const isVisible = connectState.status === 'webview' || connectState.status === 'refresh';

  // ✅ PRIMARY fix — intercept BEFORE browser gets it
  const handleShouldStartLoad = useCallback(
    (request: { url: string }) => {
      const { url } = request;

      if (url.includes('stripe-connect-success')) {
        const accountId = url.split('accountId=')[1]?.split('&')[0] ?? '';
        handleSuccess(accountId);
        return false;
      }

      if (url.includes('stripe-connect-refresh')) {
        const accountId = url.split('accountId=')[1]?.split('&')[0] ?? '';
        handleRefresh(accountId);
        return false;
      }

      return true;
    },
    [handleSuccess, handleRefresh],
  );

  // Backup — agar kisi wajah se onShouldStartLoad miss ho
  const handleNavigationStateChange = useCallback(
    (navState: any) => {
      const { url } = navState;
      if (!url) return;

      if (url.includes('stripe-connect-success')) {
        const accountId = url.split('accountId=')[1]?.split('&')[0] ?? '';
        handleSuccess(accountId);
      }
      if (url.includes('stripe-connect-refresh')) {
        const accountId = url.split('accountId=')[1]?.split('&')[0] ?? '';
        handleRefresh(accountId);
      }
    },
    [handleSuccess, handleRefresh],
  );

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={reset}>
      <SafeAreaView style={styles.fullScreen}>
        <StatusBar barStyle="light-content" backgroundColor={'#000'} />

        <View style={styles.header}>
          <TouchableOpacity onPress={reset} style={styles.closeButton}>
            <Text style={styles.closeText}>✕  Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stripe Onboarding</Text>
          <View style={{ width: 80 }} />
        </View>

        {connectState.status === 'refresh' && (
          <View style={styles.centered}>
            <Text style={styles.title}>Link Expired</Text>
            <Text style={styles.subtitle}>
              Your onboarding link expired. Please try again.
            </Text>
            <TouchableOpacity style={styles.button} onPress={reset}>
              <Text style={styles.buttonText}>Close & Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {connectState.status === 'webview' && (
          <WebView
            ref={webViewRef}
            source={{ uri: connectState.url }}
            onShouldStartLoadWithRequest={handleShouldStartLoad} // ✅ KEY FIX
            // onNavigationStateChange={handleNavigationStateChange}
            onError={() => reset()}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#635BFF" />
              </View>
            )}
            originWhitelist={['*']} // ✅ Fixed
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled={Platform.OS === 'android'}
            sharedCookiesEnabled={Platform.OS === 'ios'}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// styles same as before...

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#fff' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins-Regular',
  },
  closeButton: { padding: 4 },
  closeText: { color: '#635BFF', fontSize: 15, fontFamily: 'Poppins-Regular' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#635BFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
