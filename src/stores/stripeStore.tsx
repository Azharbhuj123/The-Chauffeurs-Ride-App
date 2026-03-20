import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConnectState,
  ConnectLinkResponse,
  AccountStatus,
} from '../types/stripe';
import base_url from '../utils/BaseUrl';

const API_BASE = base_url;

const APP_SCHEME = 'drivo';

interface StripeStore {
  // ── State ──────────────────────────────────────────────────────────────────
  connectState: ConnectState;
  accountId: string | null; // persisted across sessions
  chargesEnabled: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────
  startConnect: (authToken: string) => Promise<void>;
  handleSuccess: (accountId: string) => void;
  handleRefresh: (accountId: string) => void;
  fetchAccountStatus: (
    accountId: string,
    authToken: string,
  ) => Promise<AccountStatus | null>;
  reset: () => void;
  clearStore: () => void; // ✅ add this
}

export const useStripeStore = create<StripeStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────────────────
      connectState: { status: 'idle' },
      accountId: null,
      chargesEnabled: false,

      // ── startConnect ─────────────────────────────────────────────────────
      startConnect: async (authToken: string) => {
        console.log('🔵 startConnect called, token:', authToken);
        set({ connectState: { status: 'loading' } });

        try {
          const existingAccountId = get().accountId;
          console.log('🔵 existingAccountId:', existingAccountId);

          const response = await fetch(`${API_BASE}/stripe/connect-link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              existingAccountId: existingAccountId ?? undefined,
            }),
          });

          console.log('🔵 response status:', response.status);

          if (!response.ok) {
            const err = await response.json();
            console.log('🔴 error from server:', err);
            throw new Error(err.error || 'Failed to create connect link');
          }

          const data = await response.json();
          console.log('🟢 got url:', data.url);

          set({
            accountId: data.accountId,
            connectState: {
              status: 'webview',
              url: data.url,
              accountId: data.accountId,
            },
          });

          console.log('🟢 connectState set to webview');
        } catch (err: any) {
          console.log('🔴 startConnect catch error:', err.message);
          set({
            connectState: {
              status: 'error',
              message: err.message || 'Something went wrong',
            },
          });
        }
      },

      // ── handleSuccess ────────────────────────────────────────────────────
      handleSuccess: (accountId: string) => {
        set({
          accountId,
          connectState: { status: 'success', accountId },
        });
      },

      // ── handleRefresh ────────────────────────────────────────────────────
      handleRefresh: (accountId: string) => {
        set({
          accountId,
          connectState: { status: 'refresh', accountId },
        });
      },

      // ── fetchAccountStatus ───────────────────────────────────────────────
      fetchAccountStatus: async (
        accountId: string,
        authToken: string,
      ): Promise<AccountStatus | null> => {
        try {
          const response = await fetch(
            `${API_BASE}/stripe/account-status/${accountId}`,
            { headers: { Authorization: `Bearer ${authToken}` } },
          );
          if (!response.ok) return null;

          const status: AccountStatus = await response.json();

          console.log(status, 'statusdddd');

          // Keep chargesEnabled in sync with server
          set({ chargesEnabled: status.chargesEnabled });
          return status;
        } catch (err) {
          console.log(err, 'account error');

          return null;
        }
      },

      // ── reset ────────────────────────────────────────────────────────────
      reset: () => set({ connectState: { status: 'idle' } }),
      clearStore: () => {
        set({
          connectState: { status: 'idle' },
          accountId: null,
          chargesEnabled: false,
        });
      },
    }),

    {
      name: 'stripe-store', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        accountId: state.accountId, // only persist accountId
        chargesEnabled: state.chargesEnabled, // and charges status
        // connectState is intentionally NOT persisted (always starts fresh)
      }),
    },
  ),
);
