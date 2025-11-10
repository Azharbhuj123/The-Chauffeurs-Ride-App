// @ts-nocheck
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeIcon from 'react-native-vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';

import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, GOOGLE_MAP_API_KEY } from '../../utils/Enums';
import { useStore } from '../../stores/useStore';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useFocusEffect } from '@react-navigation/native';
import { joinUserRoom, socket } from '../../utils/socket';
import { useUserStore } from '../../stores/useUserStore';
import { showFlash } from '../../utils/flashMessageHelper';
import { useRideStore } from '../../stores/rideStore';
import SkeletonContent from 'react-native-skeleton-content';

const ConfirmBooking = ({ navigation, route }) => {
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [pickup, setPickup] = useState('Current Location');
  const [dropoff, setDropoff] = useState('123 Luxury Tower, Downtown');

  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { rideData, setRideData } = useRideStore();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New states for location suggestions
  const [activeInput, setActiveInput] = useState(null); // 'pickup' | 'dropoff'
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [ride_id, setRide_id] = useState(null);
  const intervalRef = useRef(null);

  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { location } = useStore();
  const { token, userData } = useUserStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['driver_data'],
    queryFn: () => {
      return fetchData(
        `/driver/driver-data?vehicle_id=${rideData?.selectedCar}`,
      );
    },
    keepPreviousData: true,
  });

  const { data: rideFare } = useQuery({
    queryKey: ['ride-Fare', rideData],
    queryFn: () => {
      const {
        drop_location,
        pick_location,
        selectedClass,
        selectedCar,
        isUpgradeClass,
      } = rideData || {};
      const params = new URLSearchParams({
        pickup_lat: pick_location?.latitude,
        pickup_lng: pick_location?.longitude,
        drop_lat: drop_location?.latitude,
        drop_lng: drop_location?.longitude,
        category_type: selectedClass,
        upgrade_class: isUpgradeClass || false,
        vehicle_id: selectedCar || '',
      }).toString();

      return fetchData(`/ride/ride-estimation?${params}`);
    },
    keepPreviousData: true,
    enabled:
      !!rideData?.selectedClass &&
      !!rideData?.drop_location?.latitude &&
      !!rideData?.drop_location?.longitude &&
      !!rideData?.pick_location?.latitude &&
      !!rideData?.pick_location?.longitude &&
      !!rideData?.selectedCar,
  });

  useEffect(() => {
    setRideData({
      ...rideFare?.data,
    });
  }, [rideFare]);

  const driver_own_vehicle = data?.driver_own_vehicle;

  // Initialize pickup and dropoff from rideData if available
  useEffect(() => {
    if (rideData?.pick_location) {
      setPickupLocation(rideData.pick_location);
      setPickup(rideData.pick_location.address || 'Current Location');
    }

    if (rideData?.drop_location) {
      setDropoffLocation(rideData.drop_location);
      setDropoff(
        rideData.drop_location.address || '123 Luxury Tower, Downtown',
      );
    }

    if (rideData?.isScheduledRide) {
      // 🗓️ Set date (ensure it's a Date object)
      setDate(new Date(rideData?.dateTime?.date));

      // ⏰ Convert "15:30" string to a Date object for picker
      if (rideData?.dateTime?.time) {
        const [hours, minutes] = rideData.dateTime.time.split(':').map(Number);
        const newTime = new Date();
        newTime.setHours(hours);
        newTime.setMinutes(minutes);
        newTime.setSeconds(0);
        newTime.setMilliseconds(0);
        setTime(newTime);
      }
    }
  }, [rideData]);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  // Open modal for location input
  const handleLocationInputPress = inputType => {
    setActiveInput(inputType);
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowSuggestions(false);
    setActiveInput(null);
    setSearchText('');
    setSuggestions([]);
  };

  // Fetch location suggestions (you'll need to implement this with your API)
  const fetchLocationSuggestions = async text => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // Replace this with your actual Google Places API call
      // Example structure - adjust according to your API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=${GOOGLE_MAP_API_KEY}&language=en`,
      );
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search
  const handleSearchChange = text => {
    setSearchText(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchLocationSuggestions(text);
    }, 300);
  };

  // Get place details and update location
  const handleSuggestionSelect = async item => {
    try {
      // Fetch place details to get coordinates
      // Replace with your actual API call
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_MAP_API_KEY}`,
      );
      const details = await response.json();

      const locationData = {
        address: item.description,
        latitude: details.result?.geometry?.location?.lat,
        longitude: details.result?.geometry?.location?.lng,
        place_id: item.place_id,
      };

      if (activeInput === 'pickup') {
        setPickupLocation(locationData);
        setRideData({
          pick_location: locationData,
        });
        setPickup(item.description);
      } else {
        setDropoffLocation(locationData);
        setRideData({
          drop_location: locationData,
        });
        setDropoff(item.description);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  // Use current location for pickup
  const handleUseCurrentLocation = async () => {
    // Get current location from your location service
    // This should match the structure from BookingMain
    const currentLocation = {
      address: 'Current Location',
      latitude: location?.latitude,
      longitude: location?.longitude,
    };

    setPickupLocation(currentLocation);
    setPickup('Current Location');
    handleCloseModal();
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  const startCountdown = () => {
    setTimer(30); // reset first

    // clear if already running
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.is_schedule) {
        navigation.navigate('Home');
        return;
      }
      if (data?.data?._id) {
        startCountdown(); // ✅ start timer
        showFlash({
          type: 'success',
          title: 'Ride Request Pending',
          message: 'Waiting for a driver to accept your request.',
          backgroundColor: COLORS.success,
        });
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Ride Creation Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleConfirmBooking = () => {
    let body = {
      vehicle: rideData?.selectedCar,
      payment_method: paymentMethod,
      total_fare: rideData?.totalFare,
      category_type: rideData?.selectedClass,
      ride_time_out: ride_id ? true : false,
      remaining_fare: parseInt(rideData?.remaining_due),
      ride_id: ride_id,
      is_upgrade_class: rideData?.is_upgrade_class,
      duration: rideData?.duration_min_value,
      distance: rideData?.distance,
    };

    const pickup_location = {
      type: 'Point',
      coordinates: [pickupLocation?.longitude, pickupLocation?.latitude],
      address: pickupLocation?.address,
      famous_location: pickupLocation?.shortAddress,
    };

    const drop_location = {
      type: 'Point',
      coordinates: [dropoffLocation?.longitude, dropoffLocation?.latitude],
      address: dropoffLocation?.address,
      famous_location: dropoffLocation?.shortAddress,
    };
    if (
      rideData?.isScheduledRide &&
      date instanceof Date &&
      time instanceof Date
    ) {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      const timestamp = new Date(
        `${formattedDate}T${formattedTime}:00`,
      ).toISOString();

      const schedule = {
        date: formattedDate,
        time: formattedTime,
        timestamp,
      };

      console.log(schedule, '✅ final schedule');
      body.schedule = schedule;
    } else {
      console.warn('⚠️ Date or time invalid', date, time);
    }

    body.pickup_location = pickup_location;
    body.drop_location = drop_location;
    body.drop_location = drop_location;

    triggerMutation({
      endPoint: '/ride/',
      body: body,
      method: 'post',
    });

    // navigation.navigate('RideConfirmationScreen', { driver });
  };

  useFocusEffect(
    useCallback(() => {
      console.log(userData?._id, 'userData?._id');

      if (userData?._id) {
        // joinUserRoom(userData._id.toString());

        socket.on('ride_request', data => {
          console.log(data, 'user side ride_request ');

          if (data?.ride_time_out) {
            setRide_id(data?.ride_id);
            showFlash({
              type: 'danger',
              title: 'Ride Request Time Out',
              message: data?.message,
              backgroundColor: COLORS.error,
            });
          }
          if (data?.ride_accept) {
            navigation.navigate('RideConfirmationScreen', {
              rideId: data?.ride_id,
              from: 'user',
            });
          }
        });
      }

      // ✅ Cleanup on screen blur / unmount
      return () => {
        console.log('Screen blurred, socket listeners removed.');
      };
    }, [userData?._id]),
  );

  console.log(rideData, 'rideData');

  return (
    <SafeAreaView style={styles.container}>
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
                {activeInput === 'pickup'
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

            {/* Current Location Option */}
            {activeInput === 'pickup' && searchText.length === 0 && (
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

            {/* Suggestions List */}
            {isLoadingSuggestions ? (
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
      {/* Header */}
      <TopHeader title="Confirm Booking" navigation={navigation} />

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
                    <Image
                      source={{ uri: data?.driver?.profile_image }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 50,
                      }}
                    />
                  </Text>
                </View>
                <View>
                  <Text style={styles.driverName}>{data?.driver?.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#F8D833" />
                    <Text style={styles.rating}>{data?.driver?.rating}</Text>
                    {data?.total_success_rides > 20000 ? (
                      <Text style={styles.trips}>20000+ Trips</Text>
                    ) : data?.total_success_rides > 0 ? (
                      <Text style={styles.trips}>
                        {data?.total_success_rides} Trips
                      </Text>
                    ) : (
                      <Text style={styles.trips}></Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.carDetails}>
              <View>
                <Text style={styles.carText}>
                  {driver_own_vehicle?.vehicle_make}{' '}
                  {driver_own_vehicle?.vehicle_model}
                </Text>
                <Text
                  style={[
                    styles.carText,
                    { fontSize: 11, color: '#999', paddingTop: 5 },
                  ]}
                >
                  {driver_own_vehicle?.category_type}{' '}
                  {driver_own_vehicle?.vehicle_type}
                </Text>
              </View>
              <Text style={styles.licenseText}>
                License: {driver_own_vehicle?.vehicle_plate_number}
              </Text>
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
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => handleLocationInputPress('pickup')}
            activeOpacity={0.7}
          >
            <Icon name="map-marker" size={wp(5)} color="#10B981" />
            <Text style={styles.locationInput} numberOfLines={1}>
              {pickup}
            </Text>
            <Icon name="pencil" size={wp(4)} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Drop-off Location */}
          <Text style={styles.sectionLabel}>Drop-off Location</Text>
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => handleLocationInputPress('dropoff')}
            activeOpacity={0.7}
          >
            <Icon name="map-marker" size={wp(5)} color="#374151" />
            <Text style={styles.locationInput} numberOfLines={1}>
              {dropoff}
            </Text>
            <Icon name="pencil" size={wp(4)} color="#9CA3AF" />
          </TouchableOpacity>
          {rideData?.isScheduledRide && (
            <View style={styles.dateTimeContainer}>
              {/* Date Picker Field */}
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.textValue}>
                  {date?.toLocaleDateString('en-US')}
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
                  {time
                    ? time.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </Text>

                <TimeIcon name="time-outline" size={wp(4.5)} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Date Picker Overlay */}
          {showDatePicker && (
            <View style={styles.pickerOverlay}>
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()} // ⛔ Prevent past date
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
                paymentMethod === 'Card' && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod('Card')}
            >
              <Icon name="credit-card" size={18} color="#000" />
              <Text style={styles.paymentText}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'Cash' && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod('Cash')}
            >
              <Icon name="cash" size={18} color="#000" />
              <Text style={styles.paymentText}>Cash</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fareCard}>
          <View style={styles.fareContent}>
            <View>
              <Text style={styles.fareLabel}>Total Estimated Fare</Text>
              <Text style={styles.fareAmount}>${rideData?.totalFare}</Text>
            </View>
            <View style={styles.fareDetails}>
              <Text style={styles.fareClass}>
                {rideData?.selectedClass} Class
              </Text>
              <Text style={styles.fareDistance}>
                {rideData?.distance} | {rideData?.duration_min_value}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <Button
            disabled={loading || (timer < 30 && timer > 0)} // disable while counting
            title={
              timer > 0
                ? `Waiting... ${timer}s`
                : rideData?.isScheduledRide
                ? 'Confirm Scheduled Ride'
                : 'Confirm Booking'
            }
            onPress={handleConfirmBooking}
          />

          <TouchableOpacity
            disabled={timer < 30 && timer > 0}
            onPress={() => navigation?.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel / Change Driver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Suggestions Modal */}
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
    fontFamily: 'SF Pro',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
  newSection: {
    borderWidth: 1,
    borderColor: '#F8D833',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'SF Pro',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 17, 17, 0.10)',
    paddingBottom: 10,
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
    borderRadius: 50,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
  licenseText: {
    fontSize: 14,
    fontFamily: 'SF Pro',

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
    fontFamily: 'SF Pro',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp(2),
    gap: 10,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp(3),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3.5),
    backgroundColor: '#FFFFFF',
    width: wp(40),
    elevation: 1,
    fontFamily: 'SF Pro',
  },
  textValue: {
    color: '#111827',
    fontSize: wp(4),
    fontFamily: 'SF Pro',
  },
  textInput: {
    flex: 1,
    color: '#111827',
    fontSize: wp(4),
    marginRight: wp(2),
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
  pickerCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
  paymentButtonActive: {
    backgroundColor: '#F8D833',
    borderColor: '#F8D833',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
  fareAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
  confirmButton: {
    backgroundColor: '#F8D833',
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 12,
    fontFamily: 'SF Pro',
  },
  confirmButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 16,
    borderRadius: 24,
    fontFamily: 'SF Pro',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
  },

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
  suggestionsTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  closeButton: { padding: 4 },
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
    backgroundColor: '#189237',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  currentLocationText: { fontSize: 16, fontWeight: '600', color: '#189237' },
  suggestionsList: { paddingTop: 4 },
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
  suggestionContent: { flex: 1 },
  suggestionMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionSecondary: { fontSize: 13, color: '#666', lineHeight: 18 },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  emptyContainer: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12, fontWeight: '500' },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 4 },
});

export default ConfirmBooking;
