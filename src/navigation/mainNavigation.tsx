// @ts-nocheck
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Intro from "../components/Intro";
import Splash_Screen from "../pages/splash_screens/Splash_Screen";
import Signup from "../pages/auth_screens/Signup";
import Login from "../pages/auth_screens/Login";
import Verify from "../pages/auth_screens/Verify";
import Forgot from "../pages/auth_screens/Forgot";
import SetPass from "../pages/auth_screens/SetPass";
import BottomTabs from "./BottomTabs";
import UploadDoc from "../pages/auth_screens/UploadDoc";
import Approval from "../pages/auth_screens/Approval";
import { navigationRef } from "../utils/NavigationService";
import UploadVehicle from "../pages/auth_screens/UploadVehicle"
import NotificationsScreen from "../pages/notification_screens/NotificationsScreen";
const { width } = Dimensions.get("window");



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();




export default function MainNavigation() {
  return (
        <NavigationContainer ref={navigationRef}>
      <Stack.Navigator  initialRouteName="intro" screenOptions={{ headerShown: false }}>

        <Stack.Screen name="intro" component={Intro} />
        <Stack.Screen  name="Signup" component={Signup} />
        <Stack.Screen  name="UploadDoc" component={UploadDoc} />

        <Stack.Screen  name="UploadVehicle" component={UploadVehicle} />
        <Stack.Screen name="Splash" component={Splash_Screen} />
        <Stack.Screen  name="Approval" component={Approval} />
        <Stack.Screen  name="Verify" component={Verify} />
        <Stack.Screen  name="Login" component={Login} />
        <Stack.Screen  name="Forgot" component={Forgot} />
        <Stack.Screen  name="SetPass" component={SetPass} />
          <Stack.Screen name="Notification" component={NotificationsScreen} />

        <Stack.Screen name="MainTabs" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
