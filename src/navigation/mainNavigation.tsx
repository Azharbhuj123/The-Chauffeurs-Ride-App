import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
const { width } = Dimensions.get("window"); // device width le rahe hain
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
export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 15,
          left: width * 0.05, // 5% from left
          right: width * 0.05, // 5% from right
          borderRadius: 20,
          backgroundColor: "#fff",
          height: 0.1 * width, // 10% of screen width → responsive height
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarIcon: ({ focused }) => {
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
              size={width * 0.07} // 7% of screen width
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
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});