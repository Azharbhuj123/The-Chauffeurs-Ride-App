// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,

} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';

export const TripHistoryScreen = ({ navigation }) => {
    const [trips] = useState([
        {
            id: 1,
            date: 'Completed on Oct 1, 2025 at 11:30 AM',
            price: '$42.50',
            status: 'Completed',
            pickup: 'The Grand Hotel (Pickup)',
            pickupSub: '456 Lake Road',
            dropoff: 'City Market (Drop-off)',
            dropoffSub: 'Central Shopping District',
        },
        {
            id: 2,
            date: 'Completed on Oct 1, 2025 at 11:30 AM',
            price: '$42.50',
            status: 'Completed',
            pickup: 'The Grand Hotel (Pickup)',
            pickupSub: '456 Lake Road',
            dropoff: 'City Market (Drop-off)',
            dropoffSub: 'Central Shopping District',
        },
        {
            id: 3,
            date: 'Completed on Oct 1, 2025 at 11:30 AM',
            price: '$42.50',
            status: 'Completed',
            pickup: 'The Grand Hotel (Pickup)',
            pickupSub: '456 Lake Road',
            dropoff: 'City Market (Drop-off)',
            dropoffSub: 'Central Shopping District',
        },
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
            <TopHeader title="Trip History" navigation={navigation}/>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {trips.map(trip => (
                    <View key={trip.id} style={styles.tripCard}>
                        {/* Card Header */}
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.dateText}>{trip.date}</Text>
                                <Text style={styles.priceText}>{trip.price}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{trip.status}</Text>
                            </View>
                        </View>

                        {/* Itinerary */}
                        <View style={styles.itineraryContainer}>
                            <View style={styles.line} />
                            <View style={[styles.dot, styles.pickupDot]} />
                            <View style={[styles.dot, styles.dropoffDot]} />
                            <View style={styles.locationDetails}>
                                <View style={{ marginBottom: hp(2.5) }}>
                                    <Text style={styles.locationTitle}>{trip.pickup}</Text>
                                    <Text style={styles.locationSub}>{trip.pickupSub}</Text>
                                </View>
                                <View>
                                    <Text style={styles.locationTitle}>{trip.dropoff}</Text>
                                    <Text style={styles.locationSub}>{trip.dropoffSub}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Details Button */}
                        <View style={styles.detailsButton} activeOpacity={0.8}>
                        <Button title='View Receipt & Details' onPress={()=>navigation.navigate("TripReceipt")}/>
                        </View>
                    </View>
                ))}
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
        paddingTop: hp('2%'),
        paddingBottom: hp('5%'),
    },
    tripCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: wp(4),
        marginBottom: hp(2),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: hp(1.5),
    },
    dateText: {
        fontSize: wp(3),
        color: '#666',
    },
    priceText: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#000',
        marginTop: hp(0.5),
    },
    statusBadge: {
        backgroundColor: '#e0f8e9',
        paddingVertical: hp(0.6),
        paddingHorizontal: wp(3),
        borderRadius: 20,
    },
    statusText: {
        color: '#4caf50',
        fontSize: wp(3),
        fontWeight: '500',
    },
    itineraryContainer: {
        flexDirection: 'row',
        paddingVertical: hp(2),
    },
    line: {
        width: 2,
        backgroundColor: '#e0e0e0',
        height: '80%',
        position: 'absolute',
        left: wp(1.2),
        top: '15%',
    },
    dot: {
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
        position: 'absolute',
        left: 0,
    },
    pickupDot: {
        backgroundColor: 'green',
        top: hp(1.75),
    },
    dropoffDot: {
        backgroundColor: 'red',
        bottom: hp(4),
    },
    locationDetails: {
        marginLeft: wp(6),
    },
    locationTitle: {
        fontSize: wp(3.8),
        color: '#333',
        fontWeight: '500',
    },
    locationSub: {
        fontSize: wp(3.5),
        color: '#777',
        marginTop: hp(0.2),
    },
    detailsButton: {
   
        marginTop: hp(2),
    },
    detailsButtonText: {
        fontSize: wp(4),
        color: '#000',
        fontWeight: '600',
    },
});