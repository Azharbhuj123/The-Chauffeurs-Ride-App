import { showMessage, MessageType } from 'react-native-flash-message';

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
  onPress, // ✅ accept press action
}: FlashMessageOptions) => {
  showMessage({
    message: title,
    description: message,
    type,
    backgroundColor,
    icon,
    duration,
    floating: true,
    onPress, // ✅ attach callback
    titleStyle: { fontFamily: 'Poppins-Regular', fontSize: 16, color: '#fff' },
    textStyle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#fff' },
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
