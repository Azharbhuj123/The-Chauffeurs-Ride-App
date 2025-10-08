// @ts-nocheck

import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const { width } = Dimensions.get("window");
import Icon from "react-native-vector-icons/Ionicons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Home from '../pages/home_screen/Home';
import BookingMain from '../pages/booking_screens/BookingMain';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectDriver from '../pages/booking_screens/SelectDriver';
import ConfirmBooking from '../pages/booking_screens/ConfirmBooking';
import RideConfirmationScreen from '../pages/booking_screens/RideConfirmationScreen';
import Chat from '../pages/chat/Chat';
import RideCompletedScreen from "../pages/booking_screens/RideCompletedScreen"
import PaymentSummaryScreen from '../pages/booking_screens/PaymentSummaryScreen';
import CancelRide from '../pages/booking_screens/CancelRide';
import   ProfileMainScreen  from '../pages/profile_screens/ProfileMain';
import { EditProfileScreen } from '../pages/profile_screens/EditProfile';
import { AddNewAddressScreen } from '../pages/profile_screens/AddNewAddressScreen';
import { TripHistoryScreen } from '../pages/profile_screens/TripHistoryScreen';
import { TripReceiptScreen } from '../pages/profile_screens/TripReceipt';
import ReportIssue from '../pages/profile_screens/ReportIssue';
import  {PaymentOptionsScreen}  from '../pages/profile_screens/PaymentOptionsScreen';
import  {AddNewCardScreen}  from '../pages/profile_screens/AddNewCardScreen';
import { AboutUsScreen } from '../pages/profile_screens/AboutUsScreen';
import { SettingsScreen } from '../pages/profile_screens/SettingsScreen';
import { HelpSupportScreen } from '../pages/profile_screens/HelpSupportScreen';
import { LoyaltyRewardsScreen } from '../pages/loyality_screens/LoyaltyRewardsScreen';


const Stack = createNativeStackNavigator();


function BookingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BookingMain" component={BookingMain} />
            <Stack.Screen name="SelectDriver" component={SelectDriver} />
            <Stack.Screen name="ConfirmBooking" component={ConfirmBooking} />
            <Stack.Screen name="RideConfirmationScreen" component={RideConfirmationScreen} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="RideComplete" component={RideCompletedScreen} />
            <Stack.Screen name="PaymentSummaryScreen" component={PaymentSummaryScreen} />
            <Stack.Screen name="CancelRide" component={CancelRide} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Profile" component={ProfileMainScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Address" component={AddNewAddressScreen} />
            <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
            <Stack.Screen name="TripReceipt" component={TripReceiptScreen} />
            <Stack.Screen name="ReportIssue" component={ReportIssue} />
            <Stack.Screen name="Payment" component={PaymentOptionsScreen} />
            <Stack.Screen name="AddNewCard" component={AddNewCardScreen} />
            <Stack.Screen name="About" component={AboutUsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Support" component={HelpSupportScreen} />
        </Stack.Navigator>
    );
}
 

const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    let iconName = "";
                    if (route.name === "Home") {
                        iconName = "home";
                    } else if (route.name === "Bookings") {
                        iconName = "calendar";
                    } else if (route.name === "Wallet") {
                        iconName = "gift";
                    } else if (route.name === "Profile") {
                        iconName = "person";
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={[
                                styles.tabButton,
                                isFocused && styles.tabButtonActive
                            ]}
                        >
                            <Icon
                                name={iconName}
                                size={wp('6%')}
                                color={isFocused ? "#000" : "#fff"}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default function BottomTabs() {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Bookings" component={BookingStack} options={{
                unmountOnBlur: true, // 👈 this line resets stack when you leave tab
            }} />
            <Tab.Screen name="Wallet" component={LoyaltyRewardsScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabBarContainer: {
        position: 'absolute',
        bottom: hp('4%'),
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: hp('6%'),
        paddingVertical: hp('1%'),
        // paddingHorizontal: wp('5%'),
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: hp('0.5%'),
        },
        shadowOpacity: 0.3,
        shadowRadius: hp('1%'),
        elevation: 8,
        minWidth: wp('90%'),
    },
    tabButton: {
        width: wp('15%'),
        height: wp('15%'),
        borderRadius: wp('10%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: wp('1%'),
        backgroundColor: 'rgba(255, 255, 255, 0.05)',

    },
    tabButtonActive: {
        backgroundColor: '#FFD700',
    },
});