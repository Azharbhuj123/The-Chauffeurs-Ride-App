export interface ConnectLinkResponse {
  url: string;
  accountId: string;
  expiresAt: number; // unix timestamp
}

export interface AccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    disabledReason: string | null;
  };
}

export type ConnectState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'webview'; url: string; accountId: string }
  | { status: 'success'; accountId: string }
  | { status: 'refresh'; accountId: string }
  | { status: 'error'; message: string };