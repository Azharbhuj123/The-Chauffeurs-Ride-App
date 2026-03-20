import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { useStripeStore } from '../../stores/stripeStore';
import { useUserStore } from '../../stores/useUserStore';
import { SafeAreaView } from 'react-native-safe-area-context';

// Must match APP_SCHEME in .env, Info.plist, AndroidManifest.xml
const APP_SCHEME = 'drivo';

interface Props {
  onComplete?: (accountId: string) => void;
}

export default function StripeConnectScreen({ onComplete }: Props) {
  const { token: authToken } = useUserStore();

  const connectState = useStripeStore(s => s.connectState);
  const accountId = useStripeStore(s => s.accountId);
  const chargesEnabled = useStripeStore(s => s.chargesEnabled);
  const startConnect = useStripeStore(s => s.startConnect);
  const handleSuccess = useStripeStore(s => s.handleSuccess);
  const handleRefresh = useStripeStore(s => s.handleRefresh);
  const fetchStatus = useStripeStore(s => s.fetchAccountStatus);
  const reset = useStripeStore(s => s.reset);
  const clearAccount = useStripeStore(s => s.clearAccount);

  // Fade-in animation for screen transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [connectState.status]);

  // Poll account status after success to confirm charges_enabled
  useEffect(() => {
    if (connectState.status === 'success' && authToken && accountId) {
      fetchStatus(accountId, authToken);
    }
  }, [connectState.status]);

  // ── WebView: intercept deep-link redirects from Stripe ────────────────────
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url } = navState;
      if (!url) return;

      if (url.startsWith(`${APP_SCHEME}://stripe-connect-success`)) {
        const params = new URL(url).searchParams;
        const id = params.get('accountId') || '';
        handleSuccess(id);
        onComplete?.(id);
        return;
      }

      if (url.startsWith(`${APP_SCHEME}://stripe-connect-refresh`)) {
        const params = new URL(url).searchParams;
        const id = params.get('accountId') || '';
        handleRefresh(id);
      }
    },
    [handleSuccess, handleRefresh, onComplete],
  );

  const handleConnect = useCallback(() => {
    if (!authToken) return;
    startConnect(authToken);
  }, [authToken, startConnect]);

  const handleRetry = useCallback(() => {
    reset();
    setTimeout(() => handleConnect(), 100);
  }, [reset, handleConnect]);

  // ── Already connected & charges enabled ───────────────────────────────────
  if (accountId && chargesEnabled && connectState.status === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusDot}>●</Text>
            <Text style={styles.statusBadgeText}>Active</Text>
          </View>
          <Text style={styles.title}>Stripe Connected</Text>
          <Text style={styles.subtitle}>
            Your account is fully set up and ready to accept payments.
          </Text>
          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>Account ID</Text>
            <Text style={styles.accountValue}>{accountId}</Text>
          </View>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={clearAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostButtonText}>Disconnect Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Idle ───────────────────────────────────────────────────────────────────
  if (connectState.status === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>⚡</Text>
          </View>
          <Text style={styles.title}>Connect Stripe</Text>
          <Text style={styles.subtitle}>
            Link your Stripe account to start accepting payments. You'll be
            taken through Stripe's secure onboarding — it takes about 5 minutes.
          </Text>

          <View style={styles.featureList}>
            {[
              '🔒  Bank-grade secure onboarding',
              '💳  Accept cards, wallets & more',
              '📊  Real-time payouts dashboard',
            ].map(item => (
              <Text key={item} style={styles.featureItem}>
                {item}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, !authToken && styles.buttonDisabled]}
            onPress={handleConnect}
            activeOpacity={0.85}
            disabled={!authToken}
          >
            <Text style={styles.buttonText}>Connect Stripe Account →</Text>
          </TouchableOpacity>

          {!authToken && (
            <Text style={styles.authWarning}>
              You must be signed in to connect a Stripe account.
            </Text>
          )}
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (connectState.status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.brand} />
          <Text style={styles.loadingText}>Preparing Stripe onboarding…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── WebView ────────────────────────────────────────────────────────────────
  if (connectState.status === 'webview') {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <StatusBar barStyle="dark-content" />

        {/* Header bar */}
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={reset}
            style={styles.cancelButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.cancelText}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Stripe Onboarding</Text>
          {/* Spacer to center title */}
          <View style={{ width: 70 }} />
        </View>

        <WebView
          source={{ uri: connectState.url }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={() => reset() /* reset to idle so user can retry */}
          onHttpError={() => reset()}
          startInLoadingState
          renderLoading={() => (
            <View
              style={[
                styles.center,
                StyleSheet.absoluteFillObject,
                { backgroundColor: '#fff' },
              ]}
            >
              <ActivityIndicator size="large" color={COLORS.brand} />
            </View>
          )}
          // Only allow Stripe domains + your app scheme for deep links
          originWhitelist={[
            'https://*.stripe.com',
            'https://stripe.com',
            `${APP_SCHEME}://*`,
          ]}
          javaScriptEnabled
          domStorageEnabled
          // Needed for Stripe's session cookies on Android
          thirdPartyCookiesEnabled={Platform.OS === 'android'}
          sharedCookiesEnabled={Platform.OS === 'ios'}
        />
      </SafeAreaView>
    );
  }

  // ── Refresh (link expired) ─────────────────────────────────────────────────
  if (connectState.status === 'refresh') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.stateIcon}>🔗</Text>
          <Text style={styles.title}>Link Expired</Text>
          <Text style={styles.subtitle}>
            Your onboarding session expired. This is normal — just restart and
            your progress will be saved by Stripe.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Restart Onboarding →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={reset}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (connectState.status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{connectState.message}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={reset}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (connectState.status === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Your Stripe account has been linked.
            {chargesEnabled
              ? ' You can start accepting payments immediately.'
              : ' Stripe is reviewing your account — this usually takes a few minutes.'}
          </Text>
          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>Connected Account</Text>
            <Text style={styles.accountValue}>{connectState.accountId}</Text>
            <View style={styles.capabilityRow}>
              <View
                style={[
                  styles.capabilityDot,
                  {
                    backgroundColor: chargesEnabled
                      ? COLORS.success
                      : COLORS.pending,
                  },
                ]}
              />
              <Text style={styles.capabilityText}>
                Charges {chargesEnabled ? 'enabled' : 'pending review'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={reset}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return null;
}

// ── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  brand: '#635BFF',
  brandDim: '#EEF0FF',
  success: '#22C55E',
  pending: '#F59E0B',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  text: '#111827',
  muted: '#6B7280',
  faint: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#F9FAFB',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  fullScreen: { flex: 1, backgroundColor: COLORS.white },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // ── Icon / Emoji states
  icon: { fontSize: 52, marginBottom: 20 },
  stateIcon: { fontSize: 48, marginBottom: 20 },
  successIcon: { fontSize: 56, marginBottom: 16 },

  // ── Typography
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 28,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.muted,
    fontSize: 15,
  },
  authWarning: {
    marginTop: 12,
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },

  // ── Idle screen features list
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.brandDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // ── Buttons
  button: {
    backgroundColor: COLORS.brand,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.faint,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  ghostButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  ghostButtonText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Error box
  errorBox: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.errorBg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  // ── Account card (success / already-connected screens)
  accountCard: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.faint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  accountValue: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  capabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  capabilityText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  // ── Status badge (already-connected screen)
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 5,
  },
  statusDot: {
    color: COLORS.success,
    fontSize: 10,
  },
  statusBadgeText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── WebView header
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  webViewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelButton: { padding: 4 },
  cancelText: {
    color: COLORS.brand,
    fontSize: 15,
    fontWeight: '500',
  },
});
