//@ts-nocheck
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    Image,
} from 'react-native';
import UserHeader from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';


// --- Responsive Utility Functions (Mocking Libraries like 'react-native-responsive-screen') ---
const { width, height } = Dimensions.get('window');




// 2. Location Input (Handles the From/To inputs and the swap logic)
const LocationInput = ({ fromLocation, toLocation, onSwap, onFromChange, onToChange }) => {
    const [isSwapped, setIsSwapped] = useState(false);

    const handleSwap = () => {
        // Call the parent swap function to update state values
        onSwap();
        // Toggle the local visual state for presentation
        setIsSwapped(!isSwapped);
    };

    // Determine which location text goes into which input based on the local swap state
    const [current, destination] = isSwapped
        ? [toLocation, fromLocation]
        : [fromLocation, toLocation];

    // Map the change handlers based on the visual input position
    const onCurrentChange = isSwapped ? onToChange : onFromChange;
    const onDestinationChange = isSwapped ? onFromChange : onToChange;

    // Swap Icon (Using text character for simplicity, rotated 90 degrees)
    const SwapIcon = () => (
        // <Text style={{ fontSize: wp(5), color: '#333', transform: [{ rotate: '90deg' }] }}>⇄</Text>
        <Image  style={styles.swapper} source={require("../../assets/images/toway.png")}/>
    );

    return (
        <View style={styles.locationContainer}>
            {/* Current Location Input */}
            <View style={[styles.inputRow, isSwapped ? { borderColor: '#E0E0E0' } : { borderColor: '#189237' }]}>
                <FontAwesome6 name="location-crosshairs" style={[{color: isSwapped ? "black" :"green"},styles.iconStyle]} size={wp(5)} color="green" />

                <TextInput
                    style={styles.locationInput}
                    placeholder="Current Location"
                    placeholderTextColor="#999"
                    value={current}
                    onChangeText={onCurrentChange}
                />
                {/* Swap Button (optical and professional swap action) */}
            </View>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                    <SwapIcon />
                </TouchableOpacity>

            {/* Destination Input */}
            <View style={[styles.inputRow, { marginTop: hp(1.5) }, !isSwapped ? { borderColor: '#E0E0E0' } : { borderColor: '#189237' }]}>
                <Icon name="location-outline"  style={[{color: !isSwapped ? "black" :"green"},styles.iconStyle]} size={wp(5)} />

                <TextInput
                    style={styles.locationInput}
                    placeholder="To"
                    placeholderTextColor="#999"
                    value={destination}
                    onChangeText={onDestinationChange}
                />
            </View>
        </View>
    );
};


// 3. Vehicle Class Selector (Luxury, Business, Economy buttons)
const VehicleClassSelector = ({ selectedClass, onSelect }) => {
    const classes = ['Luxury', 'Business', 'Economy'];
    return (
        <View style={styles.classSelectorContainer}>
            <Text style={styles.sectionTitle}>Choose Your Vehicle Class</Text>
            <View style={styles.classButtonsRow}>
                {classes.map((cls) => (
                    <TouchableOpacity
                        key={cls}
                        style={[
                            styles.classButton,
                            selectedClass === cls && styles.classButtonActive,
                        ]}
                        onPress={() => onSelect(cls)}
                    >
                        <Text
                            style={[
                                styles.classButtonText,
                                selectedClass === cls && styles.classButtonTextActive,
                            ]}
                        >
                            {cls}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};


// 4. Car Card (Displays car image and details)
const CarCard = ({ car, isSelected, onSelect }) => {
    return (
        <TouchableOpacity
            style={[styles.carCard, isSelected && styles.carCardSelected]}
            onPress={() => onSelect(car.name)}
        >
            <Image
                source={{ uri: car.imageUrl }}
                style={styles.carImage}
                resizeMode="contain"
            />
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.carDescription}>{car.description}</Text>
            <View style={styles.carIconsRow}>
                {/* Placeholder for small feature icons/dots */}
                <Text style={{ color: PRIMARY_YELLOW, fontSize: wp(4) }}>• • •</Text>
            </View>
        </TouchableOpacity>
    );
};


// --- Main App Component ---
export default function BookingMain() {
    const [isScheduledRide, setIsScheduledRide] = useState(false);
    const [selectedClass, setSelectedClass] = useState('Luxury');
    const [selectedCar, setSelectedCar] = useState('Prestige Sedan');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [dateTime, setDateTime] = useState({ date: '10/15/2025', time: '06:30 PM' });

    const cars = [
        {
            name: 'Prestige Sedan',
            description: 'Classic, Sedan, 3 bags or equivalent',
            // Placeholder image URL for a Sedan (Ensure a reliable placeholder is used)
            imageUrl: 'https://placehold.co/150x70/202020/ffffff?text=Sedan',
        },
        {
            name: 'Executive SUV',
            description: 'SUV, 5 seats, 6 bags or equivalent',
            // Placeholder image URL for an SUV
            imageUrl: 'https://placehold.co/150x70/202020/ffffff?text=SUV',
        },
    ];

    const handleToggle = (isSchedule) => {
        setIsScheduledRide(isSchedule);
    };

    const handleSwapLocations = useCallback(() => {
        // Simple state swap for mock functionality
        setFromLocation(toLocation);
        setToLocation(fromLocation);
    }, [fromLocation, toLocation]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>

                    {/* User Header */}
                    <UserHeader />


                    {/* --- Location Section --- */}
                    <LocationInput
                        fromLocation={fromLocation}
                        toLocation={toLocation}
                        onSwap={handleSwapLocations}
                        onFromChange={setFromLocation}
                        onToChange={setToLocation}
                    />

                    {/* --- Booking Toggle (Instant/Schedule) --- */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                !isScheduledRide && styles.toggleButtonActive,
                            ]}
                            onPress={() => handleToggle(false)}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    !isScheduledRide && styles.toggleTextActive,
                                ]}
                            >
                                Instant Booking
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                isScheduledRide && styles.toggleButtonActive,
                            ]}
                            onPress={() => handleToggle(true)}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    isScheduledRide && styles.toggleTextActive,
                                ]}
                            >
                                Schedule a Ride
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- Schedule Details (Conditional Block) --- */}
                    {/* Only appears if 'Schedule a Ride' is selected */}
                    {isScheduledRide && (
                        <View style={styles.scheduleDetails}>
                            <Text style={styles.sectionTitle}>Select desired date & time</Text>
                            <View style={styles.dateTimeRow}>
                                {/* Date Picker Mock */}
                                <TouchableOpacity style={styles.datePicker}>
                                    <Text style={styles.datePickerText}>{dateTime.date}</Text>
                                </TouchableOpacity>
                                {/* Time Picker Mock */}
                                <TouchableOpacity style={styles.timePicker}>
                                    <Text style={styles.datePickerText}>{dateTime.time}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* --- Vehicle Class Selector --- */}
                    <VehicleClassSelector
                        selectedClass={selectedClass}
                        onSelect={setSelectedClass}
                    />

                    {/* --- Car Selection Cards --- */}
                    <View style={styles.carCardsRow}>
                        {cars.map((car) => (
                            <CarCard
                                key={car.name}
                                car={car}
                                isSelected={selectedCar === car.name}
                                onSelect={setSelectedCar}
                            />
                        ))}
                    </View>

                    {/* --- Selected Driver & Fare Details --- */}
                    <View style={styles.driverSection}>
                        <View style={styles.driverInfoRow}>
                            <Text style={styles.starIcon}>★</Text>
                            <Text style={styles.bookDriverText}>Book Selected Driver</Text>
                            <TouchableOpacity>
                                {/* Note: The '>' character is correctly escaped in JSX */}
                                <Text style={styles.viewDriverText}>View Driver {'>'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.fareContainer}>
                            <View>
                                <Text style={styles.fareTitle}>Estimated Fare:</Text>
                                <Text style={styles.fareAmount}>$14.50</Text>
                            </View>
                            <Text style={styles.fareDetails}>12.5 mi | 28 min</Text>
                        </View>
                    </View>

                    {/* --- Confirm Button --- */}
                    <TouchableOpacity style={styles.confirmButton}>
                        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                    </TouchableOpacity>

                    {/* Spacing for bottom navigation (ensures scrollability) */}
                    <View style={{ height: hp(12) }} />

                </ScrollView>

            </View>
        </SafeAreaView>
    );
}

// --- Stylesheet ---
const PRIMARY_YELLOW = '#FDD835';
const LIGHT_GREY = '#F3F3F3';
const PADDING_HORIZONTAL = wp(5);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
          backgroundColor: '#fff',
        // Ensures content starts below the status bar on Android
        paddingTop: Platform.OS === 'android' ? 25 : 25,
    },
    scrollViewContent: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: hp(2),
    },

    // Header Styles (UserHeader)
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: hp(2),
        marginBottom: hp(3), // Requested margin bottom
    },
    headerTitle: {
        fontSize: wp(5),
        fontWeight: '600',
        position: 'absolute',
        alignSelf: 'center',
        left: PADDING_HORIZONTAL,
        right: PADDING_HORIZONTAL,
        textAlign: 'center',
        top: hp(2.5),
        color: '#333',
    },
    headerDetails: {
        marginLeft: wp(1),
        marginTop: hp(6), // Positions below the main title area
    },
    headerDate: {
        fontSize: wp(3.5),
        color: '#888',
    },
    headerWelcome: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: '#333',
    },
    userIcon: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        backgroundColor: PRIMARY_YELLOW,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginTop: hp(2),
    },

    // Location Input Styles
    locationContainer: {
        marginBottom: hp(2.5),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: LIGHT_GREY,
        borderRadius: 12,
        paddingHorizontal: wp(3),
        height: hp(6.5),
        borderWidth: 1,
        // The design shows a yellow border on the active/current input.
        borderColor: LIGHT_GREY,
    },
    locationInput: {
        flex: 1,
        fontSize: wp(4),
        color: '#333',
        height: '100%',
    },
    swapButton: {
        position:"absolute",
        right:0,
        zIndex:1

    },
    swapper:{
        position:"relative",
        top:hp(1),
        zIndex:50000,
        right:hp(-2)
    },

    // Toggle Styles (Instant/Schedule)
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(3),
        backgroundColor:"#F3F3F3",
        borderRadius: 50,

    },
    toggleButton: {
        flex: 1,
        paddingVertical: hp(1.5),
        marginHorizontal: wp(1.5),
        borderRadius: 50,
        alignItems: 'center',
        
    },
    toggleButtonActive: {
        backgroundColor: PRIMARY_YELLOW,
    },
    toggleText: {
        fontSize: wp(3.8),
        fontWeight: '500',
        color: '#333',
    },
    toggleTextActive: {
        color: 'black',
    },

    // Schedule Details (Date/Time)
    scheduleDetails: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: hp(1.5),
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    datePicker: {
        width: '48%',
        backgroundColor: LIGHT_GREY,
        borderRadius: 12,
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    timePicker: {
        width: '48%',
        backgroundColor: LIGHT_GREY,
        borderRadius: 12,
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    datePickerText: {
        fontSize: wp(4),
        color: '#333',
        fontWeight: '500',
    },

    // Vehicle Class Selector
    classSelectorContainer: {
        marginBottom: hp(2.5),
        backgroundColor:'#fff',
        padding: wp(6),
        borderRadius:25,
    boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',

    },
    classButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 10,
        padding: 3,
        gap:5
    },
    classButton: {
        flex: 1,
        paddingVertical: hp(1),
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor:LIGHT_GREY,
    },
    classButtonActive: {
        padding:20,
        backgroundColor: PRIMARY_YELLOW,
    },
    classButtonText: {
        fontSize: wp(3.5),
        fontWeight: '500',
        color: '#333',
    },
    classButtonTextActive: {
        fontWeight: 'bold',
    },

    // Car Cards
    carCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(3),
    },
    carCard: {
        width: wp(43),
        backgroundColor: LIGHT_GREY,
        borderRadius: 12,
        padding: wp(3),
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    carCardSelected: {
        backgroundColor: '#fff',
        borderColor: PRIMARY_YELLOW,
        // Soft shadow for selection effect
        shadowColor: PRIMARY_YELLOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    carImage: {
        width: '100%',
        height: hp(8),
        marginVertical: hp(1),
    },
    carName: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#333',
    },
    carDescription: {
        fontSize: wp(2.8),
        color: '#888',
        textAlign: 'center',
        marginVertical: hp(0.5),
    },
    carIconsRow: {
        marginTop: hp(1),
    },

    // Driver and Fare
    driverSection: {
        marginBottom: hp(3),
        borderBottomWidth: 1,
        borderBottomColor: LIGHT_GREY,
        paddingBottom: hp(2),
    },
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(2),
    },
    starIcon: {
        color: PRIMARY_YELLOW,
        fontSize: wp(4),
    },
    bookDriverText: {
        flex: 1,
        marginLeft: wp(2),
        fontSize: wp(3.8),
        fontWeight: '600',
        color: '#333',
    },
    viewDriverText: {
        color: PRIMARY_YELLOW,
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    fareContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fareTitle: {
        fontSize: wp(3.5),
        color: '#888',
    },
    fareAmount: {
        fontSize: wp(5.5),
        fontWeight: 'bold',
        color: '#333',
        marginRight: wp(2), // Removed flex: 1 here
    },
    fareDetails: {
        fontSize: wp(3.5),
        color: '#888',
    },

    // Confirm Button
    confirmButton: {
        backgroundColor: PRIMARY_YELLOW,
        borderRadius: 12,
        paddingVertical: hp(2),
        alignItems: 'center',
        shadowColor: PRIMARY_YELLOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    confirmButtonText: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        color: 'black',
    },

    // Bottom Navigation
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? hp(11) : hp(9), // Adjust height for safety and aesthetics
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: LIGHT_GREY,
        paddingBottom: Platform.OS === 'ios' ? hp(3) : 0, // Extra padding for iPhone bottom bar
    },
    navItem: {
        padding: wp(2),
    },
    navIcon: {
        fontSize: wp(6),
        color: '#888',
    },
    iconStyle: {
        marginRight: wp(3),
    },
});
