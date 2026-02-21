//@ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  Modal,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import UserHeader from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useFocusEffect } from '@react-navigation/native';
import { joinUserRoom, socket } from '../../utils/socket';
import { useUserStore } from '../../stores/useUserStore';
import { useStore } from '../../stores/useStore';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useRideStore } from '../../stores/rideStore';
import AppLoader from '../../components/AppLoader';
import CustomDropdown from '../../components/CustomDropdown';
import { COLORS, formatDate2, formatTime } from '../../utils/Enums';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

const fakeScheduleData = [
  {
    _id: '1',
    pickup_location: {
      famous_location: 'Gulberg Lahore',
    },
    schedule: {
      date: new Date('2026-02-25'),
      from: new Date('2026-02-25T09:30:00'),
      to: new Date('2026-02-25T12:45:00'),
    },
  },
  {
    _id: '2',
    pickup_location: {
      famous_location: 'Clifton Karachi',
    },
    schedule: {
      date: new Date('2026-03-01'),
      from: new Date('2026-03-01T14:00:00'),
      to: new Date('2026-03-01T18:00:00'),
    },
  },
];

export default function HomeScreen({ navigation }) {
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rideId, setRideId] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const tabBarHeight = useTabBarHeightHelper();
  const { token, userData } = useUserStore();
  const { location } = useStore();
  const is_chauffeur = userData?.owned_By ? true : false;

  const { setRideRequests, rideRequests } = useRideStore();

  const { data: ridePartner } = useQuery({
    queryKey: ['get-ride-partner'],
    queryFn: () => fetchData(`/ride/get-ride-partner?ride_id=${rideId}`),
    keepPreviousData: true,
    enabled: !!showRejectPopup,
  });
  const { data: scheduleRides, refetch } = useQuery({
    queryKey: ['driver-schdeule-ride'],
    queryFn: () => fetchData(`/ride/driver-schdeule-ride`),
    keepPreviousData: true,
  });

  const partner_data = Array.isArray(ridePartner?.data)
    ? ridePartner.data
        .filter(item => item?.vehicle_driver?._id) // only valid drivers
        .map(item => {
          const driver_data = item.vehicle_driver;

          return {
            label: driver_data?.name ?? 'Unknown Driver',
            value: driver_data?._id ?? '',
          };
        })
    : [];

  const { data, isLoading: isLoadingRide } = useQuery({
    queryKey: ['driver-latest-ride', userData],
    queryFn: () => fetchData('/ride/driver-latest-ride'),
    keepPreviousData: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (data?.in_progress) {
        navigation.navigate('RideConfirmationScreen', {
          rideId: data?.ride_id,
          from: 'driver',
        });
      }
    }, [data?.in_progress]),
  );
  const handleAddVehicle = () => {
    console.log('Add Vehicle pressed');
    navigation.navigate('AddVehicle');
  };

  const handleManageChauffeur = () => {
    console.log('Manage Chauffeur pressed');
    // navigation.navigate('AddChauffeurs');
    navigation.navigate('Chauffeur');
  };

  useFocusEffect(
    useCallback(() => {
      if (userData?._id) {
        joinUserRoom(userData._id.toString());

        const data = {
          userId: userData._id.toString(),
          lat: location?.latitude,
          lng: location?.longitude,
        };

        socket.emit('user-location', data);
      }

      // ✅ Cleanup on screen blur / unmount
      return () => {
        socket.off('user-location'); // remove listener (if any)
        console.log('Screen blurred, socket listeners removed.');
      };
    }, [userData?._id]),
  );
  useFocusEffect(
    useCallback(() => {
      
     refetch();
    }, []),
  );

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success && data?.action === 'reject_transfer') {
        setShowRejectPopup(false);

        setRideRequests(rideId);
        setRideId(null);
        setDriverId(null);
        selectedRide(null);
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleAccept = ride => {
    const body = {
      ride_id: ride?.id,
      action: 'accept',
    };
    triggerMutation({
      endPoint: '/ride/request-ride-action',
      body: body,
      method: 'post',
    });
    // navigation.navigate('AssignDriver', { ride });
  };

  const handleReject = ride => {
    setSelectedRide(ride);
    setRideRequests(ride?.id);

    // setShowRejectPopup(true);
    setRideId(ride?.id);
  };

  const handleAssignToPartner = () => {
    const data_obj = {
      ride_id: rideId,
      to_driver: driverId,
      action: 'reject_transfer',
    };

    triggerMutation({
      endPoint: '/ride/request-ride-action',
      body: data_obj,
      method: 'post',
    });
    // Add your logic here
  };

  const ridesArray = scheduleRides?.data || [];

  console.log(ridesArray, 'ridesArray');

  if (isLoadingRide) return <AppLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* User Header Component */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 40, flexGrow: 1 },
        ]}
      >
        <UserHeader navigation={navigation} />

        {rideRequests?.length > 0 && (
          <View style={styles.incomingRideContainer}>
            <Text style={styles.sectionTitle}>
              Incoming Ride Requests (Queue)
            </Text>

            {/* Ride Request Cards */}
            {rideRequests.map((ride, index) => (
              <View key={index} style={styles.rideCard}>
                {/* Pickup Location */}
                <View style={styles.locationRow1}>
                  <Icon name="location" size={20} color="#000" />
                  <Text
                    style={styles.locationText1}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {ride.pickupAddress?.slice(0, 35) || 'No pickup address'}
                  </Text>

                  <Text style={styles.priceText}>${ride?.price}</Text>
                </View>

                {/* Dropoff Location */}
                <View style={styles.locationRow}>
                  <Fontisto name="arrow-right-l" size={20} color="#11111180" />
                  <Text style={styles.locationText}>{ride.dropoffAddress}</Text>
                </View>

                {/* Date & Time */}
                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={16} color="#11111180" />
                  <Text style={styles.detailText}>{ride.date}</Text>
                </View>

                {/* Distance */}
                <View style={styles.detailRow}>
                  <Icon name="navigate-outline" size={16} color="#11111180" />
                  <Text style={styles.detailText}>
                    Distance: {ride.distance}
                  </Text>
                </View>

                {/* Payment Method */}
                <View style={styles.detailRow}>
                  <Icon name="cash-outline" size={16} color="#11111180" />
                  <Text style={styles.detailText}>
                    Payment: {ride.payment_method}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(ride)}
                  >
                    <Icon name="checkmark" size={20} color="#000" />
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(ride)}
                  >
                    <Icon name="close" size={20} color="#11111180" />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {ridesArray.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Scheduled Rides</Text>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scheduled Rides</Text>

              {ridesArray.map(ride => (
                <View
                  key={ride?._id}
                  style={[
                    styles.destinationCard,
                    ride.time_for_ride ? { borderColor: '#28a745' } : {},
                  ]}
                >
                  <View>
                    <Text style={styles.destinationTitle}>
                      {ride?.pickup_location?.famous_location ||
                        'Pickup Location'}
                    </Text>

                    <Text style={styles.destinationSubtitle}>
                      Rider: {ride?.user_name || 'Unknown'}
                      {'\n'}
                      Schedule At: {formatDate2(
                        new Date(ride?.schedule?.date),
                      )}{' '}
                      {formatTime(new Date(ride?.schedule?.from))} -{' '}
                      {formatTime(new Date(ride?.schedule?.to))}
                    </Text>
                  </View>

                  {ride.time_for_ride && (
                    <Text style={{ color: '#28a745', fontWeight: '600' }}>
                      Time for Ride!
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.noScheduleContainer}>
            <Text style={styles.noSchedule}>No Schedule Available!</Text>
          </View>
        )}

        {/* Reject Popup Modal */}
        <Modal
          visible={showRejectPopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRejectPopup(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowRejectPopup(false)}
                >
                  <Icon name="close" size={24} color="#999" />
                </TouchableOpacity>

                {/* Modal Title */}
                <Text style={styles.modalTitle}>Global Partner Dispatch</Text>
                <Text style={styles.modalSubtitle}>
                  Want to assign this ride to a Global Partner City/Country?
                </Text>

                {/* Select Partner Section */}
                <Text style={styles.inputLabel}>
                  Select Partner City/Country
                </Text>
                <CustomDropdown
                  data={partner_data}
                  placeholder="Select your partner"
                  onChange={item => setDriverId(item?.value)}
                />
                {/* Commission Text */}
                <Text style={styles.commissionText}>
                  You'll earn 10% commission on successfully dispatched.
                </Text>

                {/* Assign Button */}
                <View style={styles.assignButton}>
                  <Button
                    isLoading={loading}
                    disabled={driverId === null}
                    title="Assign Ride to Partner"
                    onPress={handleAssignToPartner}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* City Driver & Positioning Section */}
        {/* <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>City Driver & Positioning</Text>
          <Image
            style={{ width: '100%' }}
            source={require('../../assets/images/map2.png')}
          />
          Manual Repositioning
          <View style={styles.repositioningSection}>
            <Text style={styles.repositioningTitle}>Manual Repositioning</Text>
            <Text style={styles.repositioningSubtitle}>Enable Drop & Drop</Text>
          </View>
        </View> */}

        {/* Bottom Spacing */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },
  actionButtonsContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  addVehicleButton: {
    backgroundColor: COLORS.warning,
    borderRadius: wp(3),
    paddingVertical: hp(2),
    alignItems: 'center',
    marginBottom: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addVehicleText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },
  manageChauffeurButton: {
    backgroundColor: '#FFF',
    borderRadius: wp(3),
    paddingVertical: hp(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  manageChauffeurText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
  },

  mapSection: {
    backgroundColor: '#FFF',
    borderRadius: wp(3),
    padding: wp(4),

    paddingTop: hp(3),
    paddingBottom: hp(3),
    marginBottom: hp(1.5),

    elevation: 8,
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  repositioningSection: {
    borderRadius: wp(3),
    padding: wp(4),
    marginTop: 10,
    alignItems: 'center',
  },
  repositioningTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.5),
  },
  repositioningSubtitle: {
    fontSize: fs(14),
    color: '#4CAF50',
    fontWeight: '500',
  },

  incomingRideContainer: {
    backgroundColor: '#fff',
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    //  borderWidth:1,
    // borderColor:'1px solid rgba(17, 17, 17, 0.10)',
    elevation: 8,
  },

  sectionTitle: {
    fontSize: fs(18),
    color: '#000',
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  rideCard: {
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.02)',

    backgroundColor: 'rgba(17, 17, 17, 0.02)',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '1px solid rgba(17, 17, 17, 0.10)',
  },
  locationRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  locationText1: {
    fontSize: fs(16),
    color: '#333',
    marginLeft: wp(2),
    flex: 1,
  },
  locationText: {
    fontSize: fs(12),
    color: '#11111180',
    marginLeft: wp(2),
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  detailText: {
    fontSize: fs(12),
    color: '#11111180',
    marginLeft: wp(1.5),
  },
  priceText: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(2),
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.warning,
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#000',
    marginLeft: wp(1),
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#666',
    marginLeft: wp(1),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: wp('85%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: fs(25),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  modalSubtitle: {
    fontSize: fs(13),
    color: '#666',
    marginBottom: hp(2),
    lineHeight: fs(18),
  },
  inputLabel: {
    fontSize: fs(14),
    color: '#000',
    fontWeight: '500',
    marginBottom: hp(1),
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.5),
  },
  selectPlaceholder: {
    fontSize: fs(14),
    color: '#999',
  },
  commissionText: {
    fontSize: fs(12),
    color: '#666',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  assignButton: {},
  assignButtonText: {
    fontSize: fs(15),
    fontWeight: '600',
    color: '#000',
  },

  section: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1.5%'),
    fontFamily: 'Poppins-Regular',
  },
  destinationCard: {
    backgroundColor: '#fff',
    elevation: 8,

    borderWidth: 1,
    borderColor: '1px solid rgba(17, 17, 17, 0.10)',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
  },
  destinationTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  destinationSubtitle: {
    fontSize: wp('3%'),
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  noScheduleContainer: {
    flex: 1, // Full screen
    justifyContent: 'center', // Vertical center
    alignItems: 'center', // Horizontal center
  },

  noSchedule: {
    fontStyle: 'italic',
    fontSize: 16, // Text ko bada kar diya
    fontWeight: '600', // Bold
    color: '#555', // Thoda dark gray for emphasis
    textAlign: 'center', // Center text
    marginHorizontal: 20, // Side padding
  },
});
