// @ts-nocheck

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
 
    StatusBar,
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader'; // Assuming TopHeader is in a components folder
import { SafeAreaView } from 'react-native-safe-area-context';

export const SettingsScreen = ({ navigation }) => {
    const [pushNotifications, setPushNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [biometricLogin, setBiometricLogin] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
            <TopHeader title="Settings" navigation={navigation}/>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* App Preferences */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>App Preferences</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>Push Notifications</Text>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: '#767577', true: '#FDD835' }}
                            thumbColor={'#f4f3f4'}
                        />
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                        <Text style={styles.rowText}>Dark Mode</Text>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#767577', true: '#FDD835' }}
                            thumbColor={'#f4f3f4'}
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                        <Text style={styles.rowText}>Default Map View</Text>
                        <Ionicons name="chevron-forward-outline" style={styles.chevron} />
                    </TouchableOpacity>
                </View>

                {/* Security */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                        <Text style={styles.rowText}>Change Password</Text>
                        <Ionicons name="chevron-forward-outline" style={styles.chevron} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} activeOpacity={0.6} >
                        <Text style={styles.rowText}>Enable Biometric Login</Text>
                        <Switch
                            value={biometricLogin}
                            onValueChange={setBiometricLogin}
                            trackColor={{ false: '#767577', true: '#FDD835' }}
                            thumbColor={'#f4f3f4'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Data & Storage */}
                <View style={styles.card3}>
                    <Text style={styles.sectionTitle}>Data & Storage</Text>
                    <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                        <Text style={styles.rowText}>Linked Accounts</Text>
                        <Ionicons name="chevron-forward-outline" style={styles.chevron} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                        <Text style={styles.rowText}>Clear App Cache</Text>
                        <Text style={styles.rowValue}>128 MB</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollContent: {
        paddingHorizontal: wp('5%'),
        paddingBottom: hp('5%'),
    },
    sectionTitle: {
        fontSize: wp('4.5%'),
        color: '#000',
        fontWeight: '500',
        marginBottom: hp('2%'),
        marginLeft: wp(3.5),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingTop: hp(3),
        paddingBottom: hp(3),
        marginBottom: hp(3),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    card3:{
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingTop: hp(3),
        paddingBottom: hp(3),
        marginBottom: hp(10),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
   
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.8%'),
    },
    rowText: {
        fontSize: wp('4%'),
        color: '#333',
    },
    rowValue: {
        fontSize: wp('3.8%'),
        color: '#888'
    },
    chevron: {
        fontSize: wp('5%'),
        color: '#ccc',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: wp('4%'),
    },
    radioOuter: {
        width: wp('5.5%'),
        height: wp('5.5%'),
        borderRadius: wp('2.75%'),
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: wp('1.5%'),
        backgroundColor: '#FDD835',
    },
});