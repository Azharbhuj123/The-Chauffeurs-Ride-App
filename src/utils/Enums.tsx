export const COLORS = {
  success: '#189237',
  error: '#FF3A2F',
  warning: '#EEAF32',
  info: '#3498db',

  primary: '#F5A623', // Golden yellow from "Confirm Booking" / active tabs
  primaryLight: '#FFF3D6',
  primaryDark: '#D4891C',
  accent: '#2D2D2D', // Dark charcoal for headings
  background: '#F5F5F5', // Light grey app background
  white: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#7A7A7A',
  textMuted: '#AAAAAA',
  border: '#EEEEEE',
  shadow: 'rgba(0,0,0,0.08)',
  navBackground: '#1E2233', // Dark navy bottom nav
  unreadDot: '#F5A623',
  badgeRed: '#FF3B30',
};

export const error_msg = {
  color: 'red',
  fontSize: 12,
  marginTop: 0,
  marginBottom: 5,
  marginLeft: 10,
  fontWeight: '0',
  fontFamily: 'Poppins-Regular',
};

export const no_found = {
  textAlign: 'center',
  color: '#9CA3AF',
  fontSize: 14,
  marginVertical: 16,
  fontStyle: 'italic',
  alignItems: 'center',
  justifyContent: 'center',
};

export const CANCEL_REASONS = {
  User: [
    { id: 1, reason: 'Driver took too long to arrive' },
    { id: 2, reason: 'Change of plans' },
    { id: 3, reason: 'Booked another ride' },
    { id: 4, reason: 'Incorrect pickup location' },
    { id: 5, reason: 'Other reason' },
  ],
  Driver: [
    { id: 1, reason: 'Passenger was unresponsive' },
    { id: 2, reason: 'Passenger took too long to arrive' },
    { id: 3, reason: 'Incorrect drop-off location' },
    { id: 4, reason: 'Vehicle issue or emergency' },
    { id: 5, reason: 'Other reason' },
  ],
};
export const ride_role_reverse = [
  { label: 'Driver', value: 'User' },
  { label: 'User', value: 'Driver' },
];
export const vehicle_class = [
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Van / MPV', value: 'Van / MPV' },
  { label: 'XL / Large', value: 'XL / Large' },
  { label: 'Luxury Sedan', value: 'Luxury Sedan' },
  { label: 'Prestige Sedan', value: 'Prestige Sedan' },
  { label: 'Luxury SUV', value: 'Luxury SUV' },
  { label: 'Electric (EV)', value: 'Electric (EV)' },
  { label: 'Executive SUV', value: 'Executive SUV' },
  { label: 'Limousine', value: 'Limousine' },
];

export const category_class = [
  { label: 'Luxury', value: 'Luxury' },
  { label: 'Business', value: 'Business' },
  { label: 'Economy', value: 'Economy' },
];

export const monthly_filter = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

/**
 * ──────────────────────────────────────────────
 *  TIMEZONE-SAFE DATE / TIME HELPERS
 *  All internal schedule values are stored as
 *  LOCAL strings: date → "YYYY-MM-DD", time → "YYYY-MM-DDThh:mm:00"
 *  These helpers NEVER create a Date object from
 *  a string unless we explicitly need UTC conversion.
 * ──────────────────────────────────────────────
 */

/** Returns the device's IANA timezone, e.g. "Asia/Karachi" */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

/**
 * Extract "YYYY-MM-DD" from a local string or Date.
 * ⚠️  NEVER does `new Date(string)` — avoids UTC date-shift.
 */
export const formatAPIDate = (date: Date | string | null): string => {
  if (!date) return '';
  if (typeof date === 'string') {
    // "2025-04-08T00:00:00" → "2025-04-08"
    // "2025-04-08"          → "2025-04-08"
    return date.split('T')[0];
  }
  // Date object → use LOCAL methods
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Extract "HH:mm" from a local time string or Date.
 * Accepts: "2025-04-08T15:00:00" | "15:00" | Date
 */
export const formatAPITime = (time: Date | string | null): string => {
  if (!time) return '';
  if (typeof time === 'string') {
    // "2025-04-08T15:00:00" → "15:00"
    if (time.includes('T')) return time.split('T')[1].slice(0, 5);
    // Already "15:00" or "15:00:00"
    return time.slice(0, 5);
  }
  // Date object → use LOCAL methods
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/** Display helper: "YYYY-MM-DD" or placeholder */
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Select date';
  return dateStr.split('T')[0];
};

/** Display helper: "HH:mm" or "--:--" */
export const format24h = (timeStr: string | null): string => {
  if (!timeStr) return '--:--';
  if (timeStr.includes('T')) return timeStr.split('T')[1].slice(0, 5);
  return timeStr.slice(0, 5);
};

/**
 * Convert a user's LOCAL date + time strings into a proper UTC ISO string.
 *
 * @param dateStr  e.g. "2025-04-08T00:00:00" or "2025-04-08"
 * @param timeStr  e.g. "2025-04-08T15:00:00" or "15:00"
 * @returns UTC ISO string e.g. "2025-04-08T10:00:00.000Z" (for UTC+5 device)
 *
 * How it works:
 *   `new Date("2025-04-08T15:00:00")` (no Z) is interpreted as LOCAL time
 *   by the JS engine, so `.toISOString()` converts it to UTC correctly
 *   based on the device's timezone.
 */
export const localToUTC = (
  dateStr: string | null,
  timeStr: string | null,
): string | null => {
  if (!dateStr || !timeStr) return null;
  const datePart = dateStr.split('T')[0]; // "2025-04-08"
  const timePart = timeStr.includes('T')
    ? timeStr.split('T')[1].slice(0, 5)
    : timeStr.slice(0, 5); // "15:00"
  // Construct WITHOUT "Z" → parsed as LOCAL time on the device
  const localDate = new Date(`${datePart}T${timePart}:00`);
  if (isNaN(localDate.getTime())) return null;
  return localDate.toISOString(); // → UTC ISO string
};

export const formatDate2 = (date: Date) => {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(date.getDate()).padStart(2, '0')}`
    : '';
};

export const formatTime = (time: any) => {
  return time
    ? `${String(time.getHours()).padStart(2, '0')}:${String(
        time.getMinutes(),
      ).padStart(2, '0')}`
    : '';
};


export const formatTimeUTC = (time: any) => {
  return time
    ? `${String(time.getUTCHours()).padStart(2, '0')}:${String(
        time.getUTCMinutes(),
      ).padStart(2, '0')}`
    : '';
};

export const GOOGLE_MAP_API_KEY = 'AIzaSyBFf6S9vBuFCtND_1-bT8MrULsWEtnss0k';
export const STRIPE_PUBLISH_KEY =
  'pk_test_51Sv0nYCpeX6CbJY29WLaEBNODUyiR842lT4TdGBAkieasxf3mt05aOuBh394K4eOUkUASeKZTMoRXbSvGu7uYZgx00aS4iOEMe';
