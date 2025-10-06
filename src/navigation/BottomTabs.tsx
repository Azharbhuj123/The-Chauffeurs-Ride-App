// @ts-nocheck

import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const { width } = Dimensions.get("window");
import Icon from "react-native-vector-icons/Ionicons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Home from '../pages/home_screen/Home';
import BookingMain from '../pages/booking_screens/BookingMain';

 
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
                        iconName = "home-outline";
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
            <Tab.Screen name="Bookings" component={BookingMain} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
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
        bottom: hp('3%'),
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