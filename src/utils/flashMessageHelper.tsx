import { showMessage, MessageType } from 'react-native-flash-message';
import { COLORS } from './Enums';

export type FlashMessageOptions = {
  type?: MessageType;
  title?: string;
  message?: string;
  backgroundColor?: string;
  duration?: number;
  icon?: 'none' | 'auto' | 'success' | 'info' | 'warning' | 'danger';
  onPress?: () => void; // ✅ add this
};

export const showFlash = ({
  type = 'success',
  title = '',
  message = '',
  backgroundColor,
  duration = 3000,
  icon = 'auto',
  onPress,
}: FlashMessageOptions) => {
  // Custom Styling Logic for "Info" type
  const isInfo = type === 'info';

  // If type is info, use Black background, otherwise use the passed color or default
  const finalBackgroundColor = isInfo
    ? '#1A1A1A'
    : backgroundColor || undefined;
  const brandYellow = COLORS.warning;

  showMessage({
    message: title,
    description: message,
    type,
    backgroundColor: finalBackgroundColor,
    icon: isInfo ? 'info' : icon, // Force info icon for info type
    duration,
    floating: true,
    onPress,
    // Style adjustments for the "Stylish" Info look
    titleStyle: {
      fontFamily: 'Poppins-Bold', // Bold for better readability
      fontSize: 16,
      color: isInfo ? brandYellow : '#fff',
    },
    textStyle: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      color: isInfo ? '#f2f2f2' : '#fff',
    },
    // Adding a subtle border/shadow effect for that "stylish" feel
    style: isInfo
      ? {
          borderLeftWidth: 5,
          borderLeftColor: brandYellow,
          borderRadius: 10,
        }
      : {},
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
