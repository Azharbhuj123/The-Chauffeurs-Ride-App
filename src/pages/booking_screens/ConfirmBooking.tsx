// @ts-nocheck
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,

    TextInput,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeIcon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';



const ConfirmBooking = ({ navigation, route }) => {
    const { driver } = route.params;
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [pickup, setPickup] = useState("Current Location");
    const [dropoff, setDropoff] = useState("123 Luxury Tower, Downtown");

    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    };

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(false);
        setTime(currentTime);
    };

    const handleConfirmBooking = () => {
        navigation.navigate('RideConfirmationScreen', { driver });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
             
            <TopHeader  title='Confirm Booking'  navigation={navigation} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Selected Chauffeur */}
                <View style={[styles.section, styles.newSection]}>
                    <View style={styles.driverCard}>
                        <Text style={styles.sectionLabel}>Your Selected Chauffeur</Text>
                        <View style={styles.driverHeader}>
                            <View style={styles.driverInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {driver.name.split(' ').map(n => n[0]).join('')}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.driverName}>{driver.name}</Text>
                                    <View style={styles.ratingContainer}>
                                        <Icon name="star" size={14} color="#F8D833" />
                                        <Text style={styles.rating}>{driver.rating}</Text>
                                        <Text style={styles.trips}>{driver.trips}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.carDetails}>
                            <Text style={styles.carText}>{driver.car}</Text>
                            <Text style={styles.licenseText}>License: CHZ-1234</Text>
                        </View>
                        <View style={styles.amenities}>
                            <Icon name="wifi" size={18} color="#9CA3AF" />
                            <Icon name="music" size={18} color="#9CA3AF" />
                            <Icon name="briefcase" size={18} color="#9CA3AF" />
                        </View>
                    </View>
                </View>

                {/* Trip Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trip Details</Text>

                    <Text style={styles.sectionLabel}>Pickup Location</Text>
                    <View style={styles.locationCard}>
                        <Icon name="map-marker" size={wp(5)} color="#10B981" />
                        <TextInput
                            style={styles.locationInput}
                            value={pickup}
                            onChangeText={setPickup}
                            placeholder="Enter pickup location"
                            placeholderTextColor="#9CA3AF"
                        />
                        <Icon name="pencil" size={wp(4)} color="#9CA3AF" />
                    </View>

                    {/* Drop-off Location */}
                    <Text style={styles.sectionLabel}>Drop-off Location</Text>
                    <View style={styles.locationCard}>
                        <Icon name="map-marker" size={wp(5)} color="#374151" />
                        <TextInput
                            style={styles.locationInput}
                            value={dropoff}
                            onChangeText={setDropoff}
                            placeholder="Enter drop-off location"
                            placeholderTextColor="#9CA3AF"
                        />
                        <Icon name="pencil" size={wp(4)} color="#9CA3AF" />
                    </View>

                    <View style={styles.dateTimeContainer}>
                        {/* Date Picker Field */}
                        <TouchableOpacity
                            style={styles.dateTimeInput}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.textValue}>
                                {date.toLocaleDateString("en-GB")}
                            </Text>
                            <Icon name="calendar-outline" size={wp(4.5)} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Time Picker Field */}
                        <TouchableOpacity
                            style={styles.dateTimeInput}
                            onPress={() => setShowTimePicker(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.textValue}>
                                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                            <TimeIcon name="time-outline" size={wp(4.5)} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker Overlay */}
                    {showDatePicker && (
                        <View style={styles.pickerOverlay}>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                onChange={onChangeDate}
                                style={{
                                    marginTop: 10,
                                    backgroundColor: 'gray',
                                    borderRadius: 12,

                                }}
                            />

                        </View>
                    )}

                    {/* Time Picker Overlay */}
                    {showTimePicker && (
                        <View style={styles.pickerOverlay}>
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="spinner"
                                onChange={onChangeTime}
                                style={{
                                    marginTop: 10,
                                    backgroundColor: 'gray',
                                    borderRadius: 12,

                                }}
                            />

                        </View>
                    )}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentContainer}>
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                paymentMethod === 'card' && styles.paymentButtonActive,
                            ]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <Icon name="credit-card" size={18} color="#000" />
                            <Text style={styles.paymentText}>Card</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                paymentMethod === 'cash' && styles.paymentButtonActive,
                            ]}
                            onPress={() => setPaymentMethod('cash')}
                        >
                            <Icon name="cash" size={18} color="#000" />
                            <Text style={styles.paymentText}>Cash</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Fare */}
                <View style={styles.fareCard}>
                    <View style={styles.fareContent}>
                        <View>
                            <Text style={styles.fareLabel}>Total Estimated Fare</Text>
                            <Text style={styles.fareAmount}>$78.50</Text>
                        </View>
                        <View style={styles.fareDetails}>
                            <Text style={styles.fareClass}>Luxury Sedan Class</Text>
                            <Text style={styles.fareDistance}>12.5 mi | 28 min</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomButtons}>
                    
                    <Button title='Confirm Booking' onPress={handleConfirmBooking} />
                    <TouchableOpacity style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel / Change Driver</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    section: {
        marginBottom: 20,
        boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
        padding: 16,
        borderRadius: 20,


    },
    newSection: {
        borderWidth: 1,
        borderColor: '#F8D833',
    },
    sectionLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17, 17, 17, 0.10)',
        paddingBottom: 10

    },
    driverCard: {
        backgroundColor: '#FFFFFF',

        borderRadius: 20,
    },
    driverHeader: {
        marginTop: 10,
        marginBottom: 12,
    },
    driverInfo: {
        flexDirection: 'row',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    driverName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    rating: {
        fontSize: 12,
        fontWeight: '500',
        color: '#F8D833',
    },
    trips: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 4,
    },
    carDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(17, 17, 17, 0.10)',
        paddingTop: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17, 17, 17, 0.10)',
    },
    carText: {
        fontSize: 14,
        color: '#000',
    },
    licenseText: {
        fontSize: 14,
        color: '#6B7280',
    },
    amenities: {
        flexDirection: 'row',
        gap: 12,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 12,
    },
    locationInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        marginHorizontal: wp(2.5),
    },
    locationText: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    dateTimeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: hp(2),
        gap: 10
    },
    dateTimeInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: wp(3),
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3.5),
        backgroundColor: "#FFFFFF",
        width: wp(40),
        elevation: 1,
    },
    textValue: {
        color: "#111827",
        fontSize: wp(4),
    },
    textInput: {
        flex: 1,
        color: "#111827",
        fontSize: wp(4),
        marginRight: wp(2),
    },
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: 20,
    },
    pickerCloseButton: {
        backgroundColor: '#F8D833',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 20,
    },
    pickerCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    paymentContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    paymentButtonActive: {
        backgroundColor: '#F8D833',
        borderColor: '#F8D833',
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    fareCard: {
        backgroundColor: '#F8D833',
        borderRadius: 20,
        padding: wp(6),
    },
    fareContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    fareLabel: {
        fontSize: 12,
        color: '#000',
        marginBottom: 4,
    },
    fareAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
    },
    fareDetails: {
        alignItems: 'flex-end',
    },
    fareClass: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    fareDistance: {
        fontSize: 12,
        color: '#000',
        marginTop: 10,
    },
    bottomButtons: {
        marginTop: hp(5),
        marginBottom: hp(13),
    },
    confirmButton: {
        backgroundColor: '#F8D833',
        paddingVertical: 16,
        borderRadius: 24,
        marginBottom: 12,
    },
    confirmButtonText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingVertical: 16,
        borderRadius: 24,
    },
    cancelButtonText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
});

export default ConfirmBooking;