import { showMessage, MessageType } from "react-native-flash-message";

export type FlashMessageOptions = {
  type?: MessageType;
  title?: string;
  message?: string;
  backgroundColor?: string;
  duration?: number;
  icon?: "none" | "auto" | "success" | "info" | "warning" | "danger";
};

export const showFlash = ({
  type = "success",
  title = "",
  message = "",
  backgroundColor,
  duration = 3000,
  icon = "auto",
}: FlashMessageOptions) => {
  showMessage({
    message: title,
    description: message,
    type,
    backgroundColor,
    icon,
    duration,
    floating: true,
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