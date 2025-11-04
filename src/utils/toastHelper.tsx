import Toast from "react-native-toast-message";

export const showToast = ({ type = "success", title = "", message = "" }) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: 3000,
    position: "top",
 
  });
};

/*
Usage Example:

import { showToast } from "./toastHelper";

showToast({
  type: "error",
  title: "Login Failed",
  message: "Invalid credentials. Try again!",
});
*/
