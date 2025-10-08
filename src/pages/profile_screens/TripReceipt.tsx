// @ts-nocheck

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
 
    Image,
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TripReceiptScreen = ({ navigation }) => {
    // Helper component for Fare Breakdown and Trip Summary rows
    const DetailRow = ({ label, value, valueStyle }) => (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
            <TopHeader title="Trip Receipt" navigation={navigation}/>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                {/* Top Payment Card */}
                <View style={styles.paymentCard}>
                    <Text style={styles.totalPaidLabel}>Total Paid</Text>
                    <Text style={styles.totalPaidAmount}>$42.50</Text>
                    <Text style={styles.paymentMethod}>Paid via Visa **** 1234</Text>
                </View>

                {/* Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Trip Summary</Text>
                    <DetailRow label="Date & Time" value="Oct 1, 2025 at 11:30 AM" />
                    <DetailRow label="Vehicle Class" value="Prestige Sedan (Mercedes" />
                    <DetailRow label="Distance" value="14.5 km" />

                    {/* Itinerary */}
                    <View style={styles.itineraryContainer}>
                        <View style={styles.line} />
                        <View style={[styles.dot, styles.pickupDot]} />
                        <View style={[styles.dot, styles.dropoffDot]} />
                        <View style={styles.locationDetails}>
                            <View style={{ marginBottom: hp(2) }}>
                                <Text style={styles.locationLabel}>Pickup Location</Text>
                                <Text style={styles.locationValue}>Innovation Hub, Corporate Towers</Text>
                            </View>
                            <View>
                                <Text style={styles.locationLabel}>Drop-off Location</Text>
                                <Text style={styles.locationValue}>Palm View Towers, 123 Main Street</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Fare Breakdown</Text>
                    <DetailRow label="Base Fare" value="$35.00" />
                    <DetailRow label="Service Fee" value="$3.50" />
                    <DetailRow label="Taxes & Tolls" value="$3.00" />
                    <DetailRow label="Driver Tip" value="$1.00" />

                    <View style={styles.dashedLine} />

                    <DetailRow
                        label="Total Amount"
                        value="$42.50"
                        valueStyle={styles.finalAmountValue}
                    />
                </View>

                {/* Driver Card */}
                <View style={styles.driverCard}>
                    <Text style={styles.sectionTitle}>Driver & Service</Text>
                    <View style={styles.driverInfoContainer}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?u=driver1' }} // Placeholder image
                            style={styles.driverImage}
                        />
                        <View style={styles.driverTextContainer}>
                            <Text style={styles.driverName}>Driver Name</Text>
                            <Text style={styles.driverPlate}>Peter H. (Plate: XYZ-789)</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={wp(4)} color="#FDD835" />
                                <Text style={styles.ratingText}>4.9</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.downloadButton} activeOpacity={0.8}>
                        <Button title='Download Receipt' />
                        <Text style={styles.downloadButtonText}></Text>
                    </View>
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
        paddingTop: hp('2%'),
        paddingBottom: hp('5%'),
    },
    // Card Styles
    paymentCard: {
        backgroundColor: '#FDD835',
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        padding: wp(5),
    },
    detailsCard: {
        backgroundColor: '#fff',
        padding: wp(5),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    driverCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: wp(5),
        marginTop: hp(2),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    // Text & Section Styles
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: '600',
        color: '#000',
        marginBottom: hp(2),
    },
    totalPaidLabel: {
        fontSize: wp(4),
        color: '#333',
    },
    totalPaidAmount: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#000',
        marginVertical: hp(0.5),
    },
    paymentMethod: {
        fontSize: wp(3.5),
        color: '#333',
    },
    // Detail Row Styles
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1.5),
    },
    detailLabel: {
        fontSize: wp(3.8),
        color: '#666',
    },
    detailValue: {
        fontSize: wp(3.8),
        color: '#000',
        fontWeight: '500',
    },
    finalAmountValue: {
        fontWeight: 'bold',
        fontSize: wp(4.2),
    },
    // Itinerary Styles
    itineraryContainer: {
        marginVertical: hp(2.5),
        marginLeft: wp(1),
    },
    line: {
        width: 2,
        backgroundColor: '#e0e0e0',
        position: 'absolute',
        left: wp(1),
        top: hp(1),
        bottom: hp(1),
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
        top: 0,
    },
    dropoffDot: {
        backgroundColor: 'red',
        bottom: 0,
    },
    locationDetails: {
        marginLeft: wp(6),
    },
    locationLabel: {
        fontSize: wp(3.8),
        color: '#000',
        fontWeight: '600',
    },
    locationValue: {
        fontSize: wp(3.5),
        color: '#666',
        marginTop: hp(0.3),
    },
    // Dashed Line
    dashedLine: {
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ccc',
        marginVertical: hp(2),
    },
    // Driver Section
    driverInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverImage: {
        width: wp(15),
        height: wp(15),
        borderRadius: wp(7.5),
        marginRight: wp(4),
    },
    driverTextContainer: {
        flex: 1,
    },
    driverName: {
        fontSize: wp(4.2),
        fontWeight: '600',
        color: '#000',
    },
    driverPlate: {
        fontSize: wp(3.8),
        color: '#666',
        marginVertical: hp(0.4),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: wp(3.8),
        color: '#333',
        marginLeft: wp(1.5),
    },
    // Button
    downloadButton: {
        marginTop: hp(5),
    },
    downloadButtonText: {
        fontSize: wp(4.2),
        color: '#000',
        fontWeight: '600',
    },
});