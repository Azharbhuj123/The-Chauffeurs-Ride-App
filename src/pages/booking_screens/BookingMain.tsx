//@ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
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
    TouchableWithoutFeedback,
} from 'react-native';
import UserHeader from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
        <Image style={styles.swapper} source={require("../../assets/images/toway.png")} />
    );

    return (
        <View style={styles.locationContainer}>
            {/* Current Location Input */}
            <View style={[styles.inputRow, isSwapped ? { borderColor: '#E0E0E0' } : { borderColor: '#189237' }]}>
                <FontAwesome6 name="location-crosshairs" style={[{ color: isSwapped ? "black" : "green" }, styles.iconStyle]} size={wp(5)} color="green" />

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
                <Icon name="location-outline" style={[{ color: !isSwapped ? "black" : "green" }, styles.iconStyle]} size={wp(5)} />

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
                source={car.imageUrl}
                style={styles.carImage}
                resizeMode="contain"
            />
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.carDescription}>{car.description}</Text>
            <View style={styles.carIconsRow}>
                {/* Placeholder for small feature icons/dots */}
                {/* <Text style={{ color: PRIMARY_YELLOW, fontSize: wp(4) }}>• • •</Text> */}
                <Icon name="wifi" size={wp(4)} />
                <Icon name="snow" size={wp(4)} />
                <Icon name="battery-full-outline" size={wp(4)} />
            </View>
        </TouchableOpacity>
    );
};


// --- Main App Component ---
export default function BookingMain({navigation}) {
    const [isScheduledRide, setIsScheduledRide] = useState(false);
    const [selectedClass, setSelectedClass] = useState('Luxury');
    const [selectedCar, setSelectedCar] = useState('Prestige Sedan');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'time'
    const [dateTime, setDateTime] = useState({
        date: 'Select Date',
        time: 'Select Time',
    });
    const cars = [
        {
            name: 'Prestige Sedan',
            description: 'Classic, Sedan, 3 bags or equivalent',
            imageUrl: require("../../assets/images/sedan.png"),
        },
        {
            name: 'Executive SUV',
            description: 'SUV, 5 seats, 6 bags or equivalent',
            imageUrl: require("../../assets/images/suv.png"),
        },
    ];

    const handleToggle = (isSchedule) => setIsScheduledRide(isSchedule);

    const handleSwapLocations = useCallback(() => {
        setFromLocation(toLocation);
        setToLocation(fromLocation);
    }, [fromLocation, toLocation]);

    const onChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            const currentDate = new Date(selectedDate);
            if (pickerMode === 'date') {
                const formattedDate = currentDate.toLocaleDateString();
                setDateTime(prev => ({ ...prev, date: formattedDate }));
            } else {
                const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setDateTime(prev => ({ ...prev, time: formattedTime }));
            }
        }
    };


    const showDatepicker = () => {
        setPickerMode('date');
        setShowPicker(true);
    };

    const showTimepicker = () => {
        setPickerMode('time');
        setShowPicker(true);
    };

    useEffect(()=>{
        const removeItem = async () =>{

            await AsyncStorage.removeItem("CancelRide")
        }

        removeItem();

    },[])
    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>

                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* --- White Section (main content) --- */}
                    <View style={styles.whiteContainer}>
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

                        {/* --- Booking Toggle --- */}
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, !isScheduledRide && styles.toggleButtonActive]}
                                onPress={() => handleToggle(false)}
                            >
                                <Text style={[styles.toggleText, !isScheduledRide && styles.toggleTextActive]}>
                                    Instant Booking
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.toggleButton, isScheduledRide && styles.toggleButtonActive]}
                                onPress={() => handleToggle(true)}
                            >
                                <Text style={[styles.toggleText, isScheduledRide && styles.toggleTextActive]}>
                                    Schedule a Ride
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* --- Schedule Details --- */}
                        {isScheduledRide && (
                            <View style={styles.scheduleDetails}>
                                <Text style={styles.sectionTitle}>Select desired date & time</Text>

                                <View style={styles.dateTimeRow}>
                                    <TouchableOpacity style={styles.datePicker} onPress={showDatepicker}>
                                        <Text style={styles.datePickerText}>{dateTime.date}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.timePicker} onPress={showTimepicker}>
                                        <Text style={styles.datePickerText}>{dateTime.time}</Text>
                                    </TouchableOpacity>
                                </View>

                                {showPicker && (
                                    // 👇 Wrap in TouchableWithoutFeedback to detect outside taps
                                    <View style={styles.overlay}>
                                        <View style={styles.pickerContainer}>
                                            <DateTimePicker
                                                value={new Date()}
                                                mode={pickerMode}
                                                display="spinner"
                                                onChange={onChange}
                                                textColor="black"
                                                themeVariant="light"
                                                minimumDate={new Date()} // ⛔ Prevent past date
                                                style={{
                                                    marginTop:10,
                                                    backgroundColor: '#f2f2f2',
                                                    borderRadius: 12,
                                                }}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}



                        {/* --- Vehicle Class Selector --- */}
                        <VehicleClassSelector selectedClass={selectedClass} onSelect={setSelectedClass} />

                        {/* --- Car Selection --- */}
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

                        {/* --- Driver Info --- */}
                        <View style={styles.driverSection}>
                            <View style={styles.driverInfoRow}>
                                <Text style={styles.starIcon}>★</Text>
                                <Text style={styles.bookDriverText}>Book Selected Driver</Text>
                                <TouchableOpacity
                                onPress={()=>navigation.navigate('SelectDriver')}
                                    style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                >
                                    <Text style={styles.viewDriverText}>View Driver</Text>
                                    <MaterialIcons color="#FDD835" name="navigate-next" size={wp(6)} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* --- Grey Bottom Section --- */}
                    <View style={styles.bottomContent}>
                        <View style={styles.fareContainer}>
                            <View>
                                <Text style={styles.fareTitle}>Estimated Fare:</Text>
                                <Text style={styles.fareAmount}>$14.50</Text>
                            </View>
                            <Text style={styles.fareDetails}>12.5 mi | 28 min</Text>
                        </View>

                        <Button title="Confirm Booking" />
                    </View>

                </ScrollView>
            </TouchableWithoutFeedback>

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
    },
    whiteContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: PADDING_HORIZONTAL,
    },

    bottomContent: {
        backgroundColor: LIGHT_GREY,
        paddingHorizontal: PADDING_HORIZONTAL,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: height * 0.3,
        marginBottom:hp(3)
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
        position: "absolute",
        right: 0,
        zIndex: 1

    },
    swapper: {
        position: "relative",
        top: hp(1),
        zIndex: 50000,
        right: hp(-2)
    },

    // Toggle Styles (Instant/Schedule)
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(3),
        backgroundColor: "#F3F3F3",
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
        backgroundColor: '#fff',
        padding: wp(6),
        borderRadius: 25,
        boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
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
        backgroundColor: '#fff',
        padding: wp(6),
        borderRadius: 25,
        boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',

    },
    classButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 10,
        padding: 3,
        gap: 5
    },
    classButton: {
        flex: 1,
        paddingVertical: hp(1),
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: LIGHT_GREY,
    },
    classButtonActive: {
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
        boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
        borderRadius: 12,
        padding: wp(3),
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
        marginVertical: hp(1),
    },
    carName: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#333',
        textAlign: "left"
    },
    carDescription: {
        fontSize: wp(2.8),
        color: '#888',
        marginVertical: hp(0.5),
    },
    carIconsRow: {
        marginTop: hp(1),
        flexDirection: 'row',       // items in a row
        alignItems: 'center',       // vertically center
        gap: 5
    },

    // Driver and Fare
    driverSection: {

    },
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(2),
        boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
        padding: 20,
        borderRadius: 50

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
        marginTop: hp(3),
        marginBottom: hp(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: wp(90), // same as width * 0.9
        borderWidth: wp(0.3), // around 1px responsive
        borderColor: '#AFAFAF',
        paddingVertical: hp(1.2), // replaces top/bottom padding
        paddingHorizontal: wp(8), // replaces left/right padding
        borderRadius: wp(5), // responsive curve
        alignSelf: 'center', // centers it nicely
    },
    fareTitle: {
        fontSize: wp(3.5),
        color: '#888',
    },
    fareAmount: {
        fontSize: wp(5.5),
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,

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
