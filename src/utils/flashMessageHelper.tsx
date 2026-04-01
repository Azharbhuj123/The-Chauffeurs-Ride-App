import { showMessage, MessageType } from 'react-native-flash-message';
import { COLORS } from './Enums';
import { Platform, StatusBar } from 'react-native';

export type FlashMessageOptions = {
  type?: MessageType;
  title?: string;
  message?: string;
  backgroundColor?: string;
  duration?: number;
  icon?: 'none' | 'auto' | 'success' | 'info' | 'warning' | 'danger';
  onPress?: () => void; // ✅ add this
};

const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

export const showFlash = ({
  type = 'success',
  title = '',
  message = '',
  backgroundColor,
  duration = 3000,
  icon = 'auto',
  onPress,
}: FlashMessageOptions) => {
  const isInfo = type === 'info';
  const finalBackgroundColor = isInfo
    ? '#1A1A1A'
    : backgroundColor || undefined;
  const brandYellow = COLORS.warning;

  showMessage({
    message: title,
    description: message,
    type,
    backgroundColor: finalBackgroundColor,
    icon: isInfo ? 'info' : icon,
    duration,
    floating: true,
    onPress,
    // 1. Tell the library to account for the status bar
    statusBarHeight: STATUS_BAR_HEIGHT,

    style: {
      // 2. Force a top margin equal to the status bar height
      // This pushes the "floating" bubble below the clock/battery
      marginTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT : 0,

      // Keep your existing styles
      ...(isInfo
        ? {
            borderLeftWidth: 5,
            borderLeftColor: brandYellow,
            borderRadius: 10,
          }
        : {
            borderRadius: 10, // Good to have for all floating messages
          }),
    },
    titleStyle: {
      fontFamily: 'Poppins-Bold',
      fontSize: 16,
      color: isInfo ? brandYellow : '#fff',
    },
    textStyle: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      color: isInfo ? '#f2f2f2' : '#fff',
    },
  });
};
/*
Usage Example:

import { showFlash } from "./flashMessageHelper";

showFlash({
  type: "success",
  title: "Ride Accepted ✅",
  message: "Driver is arriving in 2 min",
  backgroundColor: "#2ecc71",
});
*/
