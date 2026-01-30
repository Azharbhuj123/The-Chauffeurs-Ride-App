//@ts-nocheck
import React, { useState, useCallback, useEffect, useRef } from 'react';

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
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import UserHeader from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { COLORS, GOOGLE_MAP_API_KEY, no_found } from '../../utils/Enums';
import { useStore } from '../../stores/useStore';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import UpgradeModal from '../../components/Upgrade';
import { useRideStore } from '../../stores/rideStore';
import { showToast } from '../../utils/toastHelper';
import SkeletonBox from '../../utils/SkeletonBox';

// --- Responsive Utility Functions (Mocking Libraries like 'react-native-responsive-screen') ---
const { width, height } = Dimensions.get('window');

// 2. Location Input (Handles the From/To inputs and the swap logic)
// --- Location Input Component ---
const LocationInput = ({
  fromLocation,
  toLocation,
  onSwap,
  onFromChange,
  onToChange,
  userLocation,
}) => {
  const [isSwapped, setIsSwapped] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'from' | 'to'
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAP_API_KEY}`,
      );

      const json = await res.json();

      if (!json.results?.length) return null;

      const first = json.results[0];
      const shortAddress =
        first.address_components?.[0]?.short_name ||
        first.formatted_address.split(',')[0];

      return {
        latitude: lat,
        longitude: lng,
        address: first.formatted_address,
        shortAddress: shortAddress,
        name: first.formatted_address,
        types: first.types,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };
  const fetchSuggestions = async input => {
    if (!input) return setSuggestions([]);

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input,
        )}&key=${GOOGLE_MAP_API_KEY}&language=en`,
      );
      const json = await res.json();

      if (json.status === 'OK') {
        setSuggestions(json.predictions);
      } else {
        setSuggestions([]);
        console.warn('Places API error:', json.status, json.error_message);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };
  const fetchPlaceDetails = async placeId => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAP_API_KEY}`,
      );
      const json = await res.json();

      if (json.status !== 'OK') return null;

      const result = json.result;
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address: result.formatted_address,
        shortAddress: result.name,
        name: result.name,
        types: result.types,
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  // Auto-fill pickup location on mount
  useFocusEffect(
    useCallback(() => {
      if (
        userLocation?.latitude &&
        userLocation?.longitude &&
        !fromLocation?.address
      ) {
        reverseGeocode(userLocation.latitude, userLocation.longitude).then(
          data => {
            if (data) onFromChange(data);
          },
        );
      }
    }, [userLocation, fromLocation]),
  );

  useEffect(() => {
    if (showSuggestions && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSuggestions]);

  const handleSwap = () => {
    onSwap(); // parent me swap karega
    setIsSwapped(prev => !prev); // visual swap
  };

  const [currentLocation, destinationLocation] = isSwapped
    ? [toLocation, fromLocation]
    : [fromLocation, toLocation];

  const onCurrentChange = isSwapped ? onToChange : onFromChange;
  const onDestinationChange = isSwapped ? onFromChange : onToChange;

  const handleInputPress = inputType => {
    setActiveInput(inputType);
    setShowSuggestions(true);
    setSuggestions([]);

    const currentValue =
      inputType === 'from' ? currentLocation : destinationLocation;
    setSearchText(currentValue?.address || '');
  };

  const handleSearchChange = async text => {
    setSearchText(text);
    if (text.length >= 2) await fetchSuggestions(text);
    else setSuggestions([]);
  };

  const handleSuggestionSelect = async item => {
    setIsLoading(true);
    const data = await fetchPlaceDetails(item.place_id);
    setIsLoading(false);

    if (!data) return;

    if (activeInput === 'from') onCurrentChange(data);
    else onDestinationChange(data);

    setShowSuggestions(false);
    setSuggestions([]);
    setActiveInput(null);
    setSearchText('');
  };

  const handleUseCurrentLocation = async () => {
    if (!userLocation?.latitude || !userLocation?.longitude) return;

    setIsLoading(true);
    const data = await reverseGeocode(
      userLocation.latitude,
      userLocation.longitude,
    );
    setIsLoading(false);

    if (!data) return;

    if (activeInput === 'from') onCurrentChange(data);
    else onDestinationChange(data);

    setShowSuggestions(false);
    setSuggestions([]);
    setActiveInput(null);
    setSearchText('');
  };

  const handleCloseModal = () => {
    setShowSuggestions(false);
    setActiveInput(null);
    setSearchText('');
    setSuggestions([]);
  };

  const SwapIcon = () => (
    <Image
      style={styles.swapper}
      source={require('../../assets/images/toway.png')}
    />
  );

  return (
    <View style={styles.locationContainer}>
      {/* From/Current Location Input */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleInputPress('from')}
      >
        <View
          style={[
            styles.inputRow,
            isSwapped ? { borderColor: '#E0E0E0' } : { borderColor: COLORS.success },
          ]}
        >
          <MaterialIcons
            name="my-location"
            style={[
              { color: isSwapped ? '#666' : COLORS.success },
              styles.iconStyle,
            ]}
            size={20}
          />
          <Text
            style={[
              styles.locationInput,
              !currentLocation?.address && { color: '#999' },
            ]}
          >
            {currentLocation?.address || 'Current Location'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
        <SwapIcon />
      </TouchableOpacity>

      {/* To/Destination Input */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleInputPress('to')}
      >
        <View
          style={[
            styles.inputRow,
            { marginTop: 12 },
            !isSwapped
              ? { borderColor: '#E0E0E0' }
              : { borderColor: COLORS.success },
          ]}
        >
          <MaterialIcons
            name="location-on"
            style={[
              { color: !isSwapped ? '#666' : COLORS.success },
              styles.iconStyle,
            ]}
            size={20}
          />
          <Text
            style={[
              styles.locationInput,
              !destinationLocation?.address && { color: '#999' },
            ]}
          >
            {destinationLocation?.address || 'Where to?'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestions}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable
            style={styles.suggestionsContainer}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>
                {activeInput === 'from'
                  ? 'Select Pickup Location'
                  : 'Select Drop-off Location'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <MaterialIcons
                name="search"
                size={22}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search for a location..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={handleSearchChange}
                autoFocus
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText('');
                    setSuggestions([]);
                  }}
                  style={styles.clearButton}
                >
                  <MaterialIcons name="close" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Current Location */}
            {activeInput === 'from' &&
              userLocation &&
              searchText.length === 0 && (
                <TouchableOpacity
                  style={styles.currentLocationButton}
                  onPress={handleUseCurrentLocation}
                  activeOpacity={0.7}
                >
                  <View style={styles.currentLocationIcon}>
                    <MaterialIcons name="my-location" size={22} color="#fff" />
                  </View>
                  <Text style={styles.currentLocationText}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
              )}

            {/* Suggestions / Loading */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#189237" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                keyExtractor={item => item.place_id}
                style={styles.suggestionsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionIconContainer}>
                      <MaterialIcons
                        name="location-on"
                        size={20}
                        color="#666"
                      />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionMain} numberOfLines={1}>
                        {item.structured_formatting?.main_text ||
                          item.description.split(',')[0]}
                      </Text>
                      <Text
                        style={styles.suggestionSecondary}
                        numberOfLines={2}
                      >
                        {item.structured_formatting?.secondary_text ||
                          item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : searchText.length > 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={48} color="#ddd" />
                <Text style={styles.emptyText}>No locations found</Text>
                <Text style={styles.emptySubtext}>Try a different search</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search" size={48} color="#ddd" />
                <Text style={styles.emptyText}>Start typing to search</Text>
                <Text style={styles.emptySubtext}>
                  Enter at least 2 characters
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// 3. Vehicle Class Selector (Luxury, Business, Economy buttons)
const VehicleClassSelector = ({
  selectedClass,
  onSelect,
  hasVoucher,
  setShowUpgradeModal,
  setFromClass,
  setToClass,
  upgradeShownOnce,
  setUpgradeShownOnce,
}) => {
  const classes = ['Luxury', 'Business', 'Economy'];

  const handleSelect = cls => {
    onSelect(cls);

    if (!hasVoucher) return; // no voucher = no modal
    if (upgradeShownOnce) return; // user already saw modal

    if (cls === 'Economy') {
      setFromClass('Economy');
      setToClass('Business');
      setShowUpgradeModal(true);
      setUpgradeShownOnce(true);
    }

    if (cls === 'Business') {
      setFromClass('Business');
      setToClass('Luxury');
      setShowUpgradeModal(true);
      setUpgradeShownOnce(true);
    }
    if (cls === 'Luxury') {
      setFromClass('Luxury');
    }
  };

  return (
    <View style={styles.classSelectorContainer}>
      <Text style={styles.sectionTitle}>Choose Your Vehicle Class</Text>
      <View style={styles.classButtonsRow}>
        {classes.map(cls => (
          <TouchableOpacity
            key={cls}
            style={[
              styles.classButton,
              selectedClass === cls && styles.classButtonActive,
            ]}
            onPress={() => handleSelect(cls)}
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

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr?.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const CarGridSlider = ({ cars, selectedCar, onSelect }) => {
  const carChunks = chunkArray(cars, 2); // group 2 cars per page

  return (
    <FlatList
      data={carChunks}
      keyExtractor={(item, index) => index.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: wp(90),
          }}
        >
          {item.map(car => (
            <CarCard
              key={car?.vehicle?._id}
              car={car}
              isSelected={selectedCar === car.vehicle?._id}
              onSelect={onSelect}
            />
          ))}
        </View>
      )}
    />
  );
};

const CarCard = ({ car, isSelected, onSelect }) => {
  const vehicle = car?.vehicle;

  return (
    <TouchableOpacity
      style={[
        styles.carCard,
        isSelected && styles.carCardSelected,
        { width: wp(43) }, // two cards fit per slide
      ]}
      onPress={() => onSelect(car?.vehicle?._id)}
    >
      <Image
        source={
          vehicle?.upload_documents?.front_view
            ? { uri: vehicle.upload_documents.front_view }
            : require('../../assets/images/sedan.png')
        }
        style={[styles.carImage, { width: '100%', height: 120 }]}
        resizeMode="contain"
      />

      <Text style={styles.carName}>
        {`${vehicle?.vehicle_make} (${vehicle?.vehicle_type})`}
      </Text>
      <Text style={styles.carDescription}>
        {vehicle?.vehicle_description
          ? vehicle.vehicle_description.split(' ').slice(0, 10).join(' ') +
            (vehicle.vehicle_description.split(' ').length > 10 ? '...' : '')
          : ''}
      </Text>

      <View style={styles.carIconsRow}>
        <Icon name="wifi" size={wp(4)} />
        <Icon name="snow" size={wp(4)} />
        <Icon name="battery-full-outline" size={wp(4)} />
      </View>
    </TouchableOpacity>
  );
};

// --- Main App Component ---
export default function BookingMain({ navigation }) {
  const { setRideData, rideData } = useRideStore();

  const [isScheduledRide, setIsScheduledRide] = useState(false);

  const [selectedCar, setSelectedCar] = useState();
  const [fromLocation, setFromLocation] = useState(
    rideData?.pick_location || null,
  );
  
  
  const [toLocation, setToLocation] = useState(rideData?.drop_location || null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'time'
  const [selectedClass, setSelectedClass] = useState('Economy');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgradeClass, setIsUpgradeClass] = useState(false);
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [upgradeShownOnce, setUpgradeShownOnce] = useState(false);
  const tabBarHeight = useTabBarHeightHelper();
  const { location } = useStore();

  const [dateTime, setDateTime] = useState({
    date: 'Select Date',
    time: 'Select Time',
  });
  const resetDone = useRef(false);

  console.log(fromLocation, '<<<<fromLocation');
  console.log(toLocation, '<<<<toLocation');

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'get-drivers',
      selectedClass,
      fromLocation?.latitude,
      fromLocation?.longitude,
    ],
    queryFn: () =>
      fetchData(
        `/ride/get-drivers?category_type=${selectedClass}&lat=${fromLocation?.latitude}&lng=${fromLocation?.longitude}`,
      ),
    keepPreviousData: true,
    enabled:
      !!selectedClass && !!fromLocation?.latitude && !!fromLocation?.longitude,
  });

  // check any voucher
  const {
    data: voucherData,
    isLoading: voucherLoad,
    refetch: voucherApiRefetch,
  } = useQuery({
    queryKey: ['check-voucher'],
    queryFn: () => {
      return fetchData(
        `/voucher/check-status?type=upgrade_vehicle&secondType=book_driver`,
      );
    },
    keepPreviousData: true,
  });

  // ride fare
  const {
    data: ridefare,
    isLoading: ridefareLoad,
    error: rideFareErr,
    isError,
  } = useQuery({
    queryKey: [
      'get-drivers-fare',
      selectedClass,
      fromLocation?.latitude,
      fromLocation?.longitude,
      toLocation?.latitude,
      toLocation?.longitude,
      selectedCar,
      voucherData?.voucher?.type,
      isUpgradeClass,
    ],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        pickup_lat: fromLocation?.latitude?.toString(),
        pickup_lng: fromLocation?.longitude?.toString(),
        drop_lat: toLocation?.latitude?.toString(),
        drop_lng: toLocation?.longitude?.toString(),
        category_type: fromClass == '' ? selectedClass : fromClass,
        upgrade_class: isUpgradeClass,
        vehicle_id: selectedCar || '',
      }).toString();

      return fetchData(`/ride/ride-estimation?${queryParams}`);
    },
    keepPreviousData: true,
    enabled:
      !!selectedClass &&
      !!fromLocation?.latitude &&
      !!fromLocation?.longitude &&
      !!toLocation?.latitude &&
      !!toLocation?.longitude &&
      !!selectedCar,
  });

   


  useEffect(() => {
      if(rideData?.pick_location){
        setFromLocation(rideData?.pick_location);
      }

      if(rideData?.drop_location){
        setToLocation(rideData?.drop_location);
      }
  },[rideData]);

  useFocusEffect(
    useCallback(() => {
      setSelectedCar(data?.allDrivers[0]?.vehicle?._id);
    }, [data?.allDrivers]),
  );

  useFocusEffect(
    useCallback(() => {
      voucherApiRefetch();
    }, []),
  );

  const handleToggle = isSchedule => setIsScheduledRide(isSchedule);

  const handleSwapLocations = useCallback(() => {
    setFromLocation(prev => toLocation);
    setToLocation(prev => fromLocation);
  }, [fromLocation, toLocation]);

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      const currentDate = new Date(selectedDate);

      if (pickerMode === 'date') {
        const formattedDate = currentDate.toISOString().split('T')[0];
        setDateTime(prev => ({ ...prev, date: formattedDate }));
      } else {
        const hours = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
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

  useFocusEffect(
    useCallback(() => {
      const removeItem = async () => {
        await AsyncStorage.removeItem('CancelRide');
      };
      removeItem();
    }, []),
  );

  const handleBooking = () => {
    let voucher_ids = [];
    if (isUpgradeClass) {
      voucher_ids.push(voucherData?.voucher?._id);
    }

    setRideData({
      pick_location: fromLocation,
      drop_location: toLocation,
      selectedClass,
      for_api_class: fromClass == '' ? selectedClass : fromClass,
      ...ridefare?.data,
      selectedCar,
      is_upgrade_class: isUpgradeClass,
      is_schedule: false,
      isScheduledRide,
      dateTime,
      voucher_ids,
    });

    navigation.navigate('ConfirmBooking');
  };

  const hanldeView = () => {
    if (!fromLocation || !toLocation) {
      showToast({
        title: 'Action Failed',
        message: 'Please enter pickup and drop location',
        type: 'error',
      });
      return;
    }
    setRideData({
      pick_location: fromLocation,
      drop_location: toLocation,
    });
    navigation.navigate('SelectDriver', {
      voucher_id: voucherData?.sec_voucher?._id,
    });
  };

  useEffect(() => {
    if (isError) {
      const backendMessage =
        rideFareErr?.response?.data?.message || 'Something went wrong';

      showToast({
        title: 'Error',
        message: backendMessage,
        type: 'error',
      });
    }
  }, [isError]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setFromClass('');
          setToClass('');
          setIsUpgradeClass(false);
        }}
        onConfirm={() => {
          setShowUpgradeModal(false);
          setSelectedClass(toClass); // auto upgrade
          setIsUpgradeClass(true);
        }}
        fromClass={fromClass}
        toClass={toClass}
      />

      <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: tabBarHeight - 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* --- White Section (main content) --- */}
          <View style={styles.whiteContainer}>
            <UserHeader />
            {/* User Header */}

            {/* --- Location Section --- */}
            <LocationInput
              fromLocation={fromLocation}
              toLocation={toLocation}
              onSwap={handleSwapLocations}
              onFromChange={setFromLocation}
              onToChange={setToLocation}
              userLocation={location}
            />

            {/* --- Booking Toggle --- */}
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

            {/* --- Schedule Details --- */}
            {isScheduledRide && (
              <View style={styles.scheduleDetails}>
                <Text style={styles.sectionTitle}>
                  Select desired date & time
                </Text>

                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={styles.datePicker}
                    onPress={showDatepicker}
                  >
                    <Text style={styles.datePickerText}>{dateTime.date}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.timePicker}
                    onPress={showTimepicker}
                  >
                    <Text style={styles.datePickerText}>{dateTime.time}</Text>
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  // 👇 Wrap in TouchableWithoutFeedback to detect outside taps
                  <View style={styles.overlay}>
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={
                          pickerMode === 'date'
                            ? new Date(dateTime.date)
                            : new Date(dateTime.time)
                        }
                        mode={pickerMode}
                        display={'spinner'} // 👈 for date use 'default'
                        onChange={onChange}
                        textColor="black"
                        themeVariant="light"
                        is24Hour={false}
                        minimumDate={new Date()} // ⛔ Prevent past date
                        style={{
                          marginTop: 10,
                          backgroundColor: '#f2f2f2',
                          borderRadius: 12,
                        }}
                      />
                      <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => setShowPicker(false)}
                      >
                        <Text
                          style={{
                            color: '#000',
                            fontSize: 16,
                            textAlign: 'center',
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* --- Vehicle Class Selector --- */}
            <VehicleClassSelector
              selectedClass={selectedClass}
              onSelect={setSelectedClass}
              hasVoucher={voucherData?.voucher?.type}
              setShowUpgradeModal={setShowUpgradeModal}
              setFromClass={setFromClass}
              setToClass={setToClass}
              upgradeShownOnce={upgradeShownOnce}
              setUpgradeShownOnce={setUpgradeShownOnce}
            />

            {/* --- Car Selection --- */}
            {isLoading ? (
              <View
                style={{
                  height: height * 0.2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {data?.allDrivers?.length === 0 &&
                data?.no_available_drivers ? (
                  <View
                    style={{
                      height: height * 0.2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={styles.no_aviable}>{data?.message}</Text>
                  </View>
                ) : (
                  <CarGridSlider
                    cars={data?.allDrivers} // pass the full array
                    selectedCar={selectedCar}
                    onSelect={setSelectedCar}
                  />
                )}
              </View>
            )}
            {voucherData?.is_sec_voucher && (
              // {/* --- Driver Info --- */}
              <View style={styles.driverSection}>
                <View style={styles.driverInfoRow}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.bookDriverText}>
                    Book Selected Driver
                  </Text>
                  <TouchableOpacity
                    onPress={hanldeView}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={styles.viewDriverText}>View Driver</Text>
                    <MaterialIcons
                      color="#FDD835"
                      name="navigate-next"
                      size={wp(6)}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* --- Grey Bottom Section --- */}
          <View style={[styles.bottomContent]}>
            {ridefareLoad ? (
              <SkeletonBox
                height={90}
      
                marginTop={hp(3)}
                marginBottom={hp(2000)}
                padding={30}
                width={wp(90)}
              />
            ) : (
              <View style={styles.fareContainer}>
                <View>
                  <Text style={styles.fareTitle}>Estimated Fare:</Text>
                  <Text style={styles.fareAmount}>
                    ${ridefare?.data?.totalFare || 0}
                  </Text>
                </View>
                <Text style={styles.fareDetails}>
                  {ridefare?.data?.distance || `0.0 km`} |{' '}
                  {ridefare?.data?.duration_min_value || `0.0 min`}
                </Text>
              </View>
            )}

            <View style={{ paddingHorizontal: wp(6), marginTop: ridefareLoad ? hp(1):hp(0) }}>
              <Button
                disabled={
                  !ridefare?.data?.totalFare || ridefare?.data?.totalFare == 0
                }
                onPress={handleBooking}
                title="Confirm Booking"
              />
            </View>
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
    paddingTop: Platform.OS === 'android' ? 25 : 25,
  },

  whiteContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: PADDING_HORIZONTAL,
  },

  bottomContent: {
    // paddingHorizontal: PADDING_HORIZONTAL,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: height * 0.3,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(2),
    marginBottom: hp(3),
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
    marginTop: hp(6),
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
    borderColor: LIGHT_GREY,
    position: 'relative', // <-- add this
  },
  locationInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#333',
    paddingTop: hp(0.4),
    marginLeft: wp(2),
  },
  swapButton: { position: 'absolute', right: 0, zIndex: 10 },
  swapper: { position: 'relative', top: hp(1.4), zIndex: 50000, right: hp(-2) },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
    backgroundColor: '#F3F3F3',
    borderRadius: 50,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    marginHorizontal: wp(1.5),
    borderRadius: 50,
    alignItems: 'center',
    fontFamily: 'SF Pro',
  },
  toggleButtonActive: {
    backgroundColor: PRIMARY_YELLOW,
  },
  toggleText: {
    fontSize: wp(3.8),
    fontWeight: '500',
    color: '#333',
    fontFamily: 'SF Pro',
  },
  toggleTextActive: {
    color: 'black',
  },

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
    fontFamily: 'SF Pro',
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
    gap: 5,
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

  carCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  carCard: {
    width: wp(43),
    borderRadius: 12,
    padding: wp(3),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  carCardSelected: {
    backgroundColor: '#fff',
    borderColor: PRIMARY_YELLOW,
    shadowColor: PRIMARY_YELLOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  carImage: {
    width: '100%',
    height: hp(10),
    marginVertical: hp(1),
  },
  carName: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    fontFamily: 'SF Pro',
  },
  carDescription: {
    fontSize: wp(2.8),
    color: '#888',
    marginVertical: hp(0.5),
    fontFamily: 'SF Pro',
  },
  carIconsRow: {
    marginTop: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  driverSection: {},
  driverInfoRow: {
    marginTop: hp(3),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2),
    boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
    padding: 20,
    borderRadius: 50,
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
    fontFamily: 'SF Pro',
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
    width: wp(90),
    borderWidth: wp(0.3),
    borderColor: '#AFAFAF',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(8),
    borderRadius: wp(5),
    alignSelf: 'center',
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
    marginRight: wp(2),
  },
  fareDetails: {
    fontSize: wp(3.5),
    color: '#888',
  },

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

  // **must be in style starts here**
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 32,
    color: '#666',
    fontWeight: '300',
    lineHeight: 32,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f0f8f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 8,
  },
  currentLocationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  suggestionsList: {
    paddingTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  suggestionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionSecondary: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },

  no_aviable: no_found,
  doneBtn: {
    justifyContent: 'center',
    width: '100%',
    color: '#000',
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    marginTop: hp(2),
    padding: hp(1.5),
    borderRadius: 12,
  },
});
