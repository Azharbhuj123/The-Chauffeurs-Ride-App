// src/navigation/MainNavigation.tsx
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
import Verify from "../pages/auth_screens/Verify";

const { width } = Dimensions.get("window");

const HomeScreen = () => (
  <View style={styles.screen}>
    <Text>Home</Text>
  </View>
);
const BookingScreen = () => (
  <View style={styles.screen}>
    <Text>Booking</Text>
  </View>
);
const WalletScreen = () => (
  <View style={styles.screen}>
    <Text>Wallet</Text>
  </View>
);
const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text>Profile</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 15,
          left: width * 0.05,
          right: width * 0.05,
          borderRadius: 20,
          backgroundColor: "#fff",
          height: 0.1 * width,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Bookings") {
            iconName = focused ? "car" : "car-outline";
          } else if (route.name === "Wallet") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return (
            <Icon
              name={iconName}
              size={width * 0.07}
              color={focused ? "#FFD700" : "#999"}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


export default function MainNavigation() {
  return (
        <NavigationContainer>
      <Stack.Navigator  initialRouteName="intro" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="intro" component={Intro} />
        <Stack.Screen name="Splash" component={Splash_Screen} />
        <Stack.Screen name="Login" component={BookingScreen} />
        <Stack.Screen  name="Signup" component={Signup} />
        <Stack.Screen  name="Verify" component={Verify} />
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
