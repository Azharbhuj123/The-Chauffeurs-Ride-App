import { LinkingOptions } from '@react-navigation/native';

/**
 * React Navigation deep link config.
 * Use this if you have React Navigation set up.
 * If you don't, App.tsx handles deep links via Linking.addEventListener instead.
 */
export const linkingConfig: LinkingOptions<any> = {
  prefixes: ['yourapp://'],
  config: {
    screens: {
      StripeConnectSuccess: 'stripe-connect-success',
      StripeConnectRefresh: 'stripe-connect-refresh',
    },
  },
};