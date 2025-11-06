//@ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopHeader from '../../components/TopHeader';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useFocusEffect } from '@react-navigation/native';
import AppLoader from '../../components/AppLoader';
import Button from '../../components/Button';
import { useUserStore } from '../../stores/useUserStore';
import { COLORS } from '../../utils/Enums';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showFlash } from '../../utils/flashMessageHelper';
import { joinUserRoom, socket } from '../../utils/socket';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const RideConfirmationScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('Your Ride is Accepted');
  const [rideStatus, setRideStatus] = useState('Accepted');
  const tabBarHeight = useTabBarHeightHelper();
  const { rideId, from } = route.params || {};
  console.log(rideId, 'rideId');

  const { role, userData } = useUserStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ride_view', rideId],
    queryFn: () => fetchData(`/ride/${rideId}`),
    keepPreviousData: true,
    enabled: !!rideId,
  });
 

  useFocusEffect(
    useCallback(() => {
      if (data?.data?.ride_status) {
        const title_set =
          data?.data?.ride_status === 'Arrived'
            ? 'Your Ride Is Arrived'
            : data?.data?.ride_status === 'Started'
            ? 'Your Ride Is Underway'
            : data?.data?.ride_status === 'Completed'
            ? 'Ride Has Been Completed'
            : title;
        setTitle(title_set);
        setRideStatus(data?.data?.ride_status);
      }

      refetch();
    }, [data?.data?.ride_status]),
  );

  const getInitials = (fullName = '') => {
    if (!fullName) return '';

    const words = fullName.trim().split(' ');
    if (words.length === 1) {
      return words[0][0].toUpperCase(); // e.g. "Madonna" → "M"
    }

    // Take first letter of first & last word
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return (first + last).toUpperCase();
  };

  // Dummy driver data. In a real app, this would come from `route.params`
  const driver = {
    name: data?.data?.driver?.name,
    initials: getInitials(data?.data?.driver?.name),
    carModel: data?.data?.vehicle?.vehicle_model,
    licensePlate: data?.data?.vehicle?.vehicle_plate_number,
    rating: data?.data?.driver?.rating,
  };

  const handlePress = async path => {
    try {
      // Always both key and value as strings
      await AsyncStorage.setItem('CancelRide', 'true');
      navigation.navigate(path);
    } catch (error) {
      console.log('Error saving AsyncStorage:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userData?._id) {
        socket.on('ride_request', data => {
          if (data?.ride_arrived) {
            setTitle('Your Ride is Arrived');
            setRideStatus(data?.ride_status);
          }
          if (data?.ride_start) {
            setTitle('Your Ride is Underway');
            setRideStatus(data?.ride_status);
          }
          if (data?.ride_completed) {
            const where_to_go =
              role === 'Driver' ? 'DriverHome' : 'RideComplete';

            navigation.navigate(where_to_go,{
              rideId:data?.ride_id
            });

            setTitle('Ride Has Been Completed');
            setRideStatus(data?.ride_status);
          }
        });
      }

      return () => {
        socket.off('ride_request');
        console.log('ride_request listener removed ✅');
      };
    }, [userData?._id]),
  );

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {},
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleAction = action => {
    const body = {
      ride_id: rideId,
      action,
    };
    triggerMutation({
      endPoint: '/ride/request-ride-action',

      body,
      method: 'post',
    });
  };

  if (isLoading) {
    return <AppLoader />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeader title={title} navigation={navigation} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom:
            role === 'Driver' ? tabBarHeight * 0.1 : tabBarHeight * 0.4,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Map Container View --- */}
        <View style={styles.mapContainer}>
          <Image
            style={styles.mapImage}
            source={require('../../assets/images/newmap.png')}
          />

          {/* ETA Banner */}
          {rideStatus === 'Accepted' ? (
            <View style={styles.etaContainer}>
              <Icon name="clock-time-three-outline" size={20} color="#333" />
              <Text style={styles.etaTextBold}>Driver En Route</Text>
              <Text style={styles.etaText}>{data?.data?.duration} ETA</Text>
            </View>
          ) : (
            ''
          )}

          {/* Pickup Location Marker */}
          <View style={styles.pickupMarkerContainer}>
            <View style={styles.pickupPin}>
              <View style={styles.pickupIcon}>
                <Ionicon name="man" size={20} color="white" />
              </View>
              <View style={styles.pickupAddressBox}>
                <Text style={styles.pickupLabel}>PICK UP AT</Text>
                <Text style={styles.pickupAddress}>325 5th Ave, NY...</Text>
              </View>
              <Icon
                name="chevron-right"
                size={22}
                color="#888"
                style={{ alignSelf: 'center' }}
              />
            </View>
            <View style={styles.pinCircle} />
          </View>

          {/* Static route line */}
          <Image
            source={require('../../assets/images/route-line.png')}
            style={styles.routeLine}
          />
        </View>

        {/* --- Driver Info Card --- */}
        <View style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{driver.initials}</Text>
            </View>

            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.carDetails}>
                {driver.carModel}{' '}
                <Text style={styles.licensePlate}>{driver.licensePlate}</Text>
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{driver.rating}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handlePress('CancelRide')}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePress('Chat')}
              style={styles.contactButton}
            >
              <Icon name="message-processing" size={20} color="#000" />
              <Text style={styles.contactButtonText}>Contact Driver</Text>
            </TouchableOpacity>
          </View>
          {role === 'Driver' &&
            (rideStatus === 'Accepted' ? (
              <View style={{ marginTop: hp(3) }}>
                <Button
                  onPress={() => handleAction('arrived')}
                  title="Mark as Arrived"
                />
              </View>
            ) : rideStatus === 'Arrived' ? (
              <View style={{ marginTop: hp(3) }}>
                <Button
                  onPress={() => handleAction('ride_start')}
                  title="Start The Ride"
                />
              </View>
            ) : (
              <View style={{ marginTop: hp(3) }}>
                <Button
                  onPress={() => handleAction('ride_completed')}
                  title="Mark As Completed"
                />
              </View>
            ))}
        </View>
      </ScrollView>
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
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  mapContainer: {
    flex: 1, // Takes up remaining space
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  etaContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FDD835', // A nice yellow color
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  etaTextBold: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    fontFamily: 'SF Pro',
  },
  etaText: {
    marginLeft: 'auto', // Pushes it to the right
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    fontFamily: 'SF Pro',
  },
  pickupMarkerContainer: {
    position: 'absolute',
    top: '30%', // Adjust as needed
    left: '50%',
    transform: [{ translateX: -wp('40%') }], // Center it based on its width
    alignItems: 'center',
  },
  pickupPin: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: wp('80%'),
    alignItems: 'center',
  },
  pickupIcon: {
    backgroundColor: '#3B82F6', // Blue color
    padding: 8,
    borderRadius: 8,
  },
  pickupAddressBox: {
    marginLeft: 10,
    flex: 1, // Takes available space
  },
  pickupLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  pickupAddress: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  pinCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: 'white',
    marginTop: -8, // Overlap the pin
    elevation: 6,
  },
  routeLine: {
    position: 'absolute',
    top: '37%', // Position it to connect pin to bottom
    left: '50%',
    transform: [{ translateX: -15 }], // Adjust to center the line image
    width: 30, // Width of your dashed line image
    height: height * 0.25, // Adjust height as needed
    resizeMode: 'contain',
  },
  driverCard: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: hp(12),
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'SF Pro',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDD835', // Light yellow
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#000', // Darker yellow
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SF Pro',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  carDetails: {
    fontSize: 14,
    color: 'gray',
  },
  licensePlate: {
    color: 'gray',
    borderLeftWidth: 1,
    borderLeftColor: 'gray',
    fontFamily: 'SF Pro',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SF Pro',

    color: '#FDD835',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D3D3D3',
    paddingTop: hp(3),
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
    fontFamily: 'SF Pro',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'SF Pro',
  },
  contactButton: {
    flex: 1,
    backgroundColor: COLORS.warning,
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    fontFamily: 'SF Pro',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    fontFamily: 'SF Pro',
  },
});

export default RideConfirmationScreen;
