// @ts-nocheck

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from '../../components/Header';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useUserStore } from '../../stores/useUserStore';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { formatSmartDate } from '../../utils/DateFormats';
import { COLORS } from '../../utils/Enums';
import { useLoaderStore } from '../../stores/useLoaderStore';
import AppLoader from '../../components/AppLoader';
import { useStore } from '../../stores/useStore';
import { socket, joinUserRoom } from '../../utils/socket';

export default function Home({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const tabBarHeight = useTabBarHeightHelper();
  const { token, userData } = useUserStore();
  const { showLoader, hideLoader } = useLoaderStore();
  const { location } = useStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-home'],
    queryFn: () => fetchData('/ride/user-screen'),
    keepPreviousData: true,

  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );
  useFocusEffect(
    useCallback(() => {
      console.log(userData?._id, 'userData?._id');

      if (userData?._id) {
        // joinUserRoom(userData._id.toString());

        const data = {
          userId: userData._id.toString(),
          lat: location?.latitude,
          lng: location?.longitude,
        };

        socket.emit('user-location', data);
      }

      // ✅ Cleanup on screen blur / unmount
      return () => {
        if (userData?._id) {
          socket.emit('leave-room', userData._id.toString()); // optional
        }
        socket.off('user-location'); // remove listener (if any)
        console.log('Screen blurred, socket listeners removed.');
      };
    }, [userData?._id, location]),
  );

  const loyaltyData = [
    {
      id: '1',
      badge: 'PRESTIGE MEMBER',
      points: '1,500 Points',
      subtext: 'Earn a free upgrade on your next ride!',
      rightText: 'First',
      rightSubtext: 'Value on',
    },
    {
      id: '2',
      badge: 'GOLD MEMBER',
      points: '2,800 Points',
      subtext: 'Get 20% off on your next 3 rides!',
      rightText: 'Premium',
      rightSubtext: 'Rewards',
    },
    {
      id: '3',
      badge: 'PLATINUM MEMBER',
      points: '5,000 Points',
      subtext: 'Unlock exclusive benefits and perks!',
      rightText: 'Elite',
      rightSubtext: 'Status',
    },
  ];

  const onScroll = event => {
    const slideSize = wp('90%');
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  const renderLoyaltyCard = ({ item }) => (
    <View style={styles.loyaltyCard}>
      <View style={styles.loyaltyContent}>
        <Text style={styles.loyaltyBadge}>{item.badge}</Text>
        <Text style={styles.loyaltyPoints}>{item.points}</Text>
        <Text style={styles.loyaltySubtext}>{item.subtext}</Text>
      </View>
    </View>
  );

  const getRideStatusText = status => {
    console.log(status, 'status');

    switch (status) {
      case 'Pending':
        return 'Searching for a driver...';
      case 'Accepted':
        return 'Driver accepted your ride, on the way!';
      case 'Started':
        return 'Your trip has started';
      case 'Completed':
        return 'Trip completed!';
      case 'Cancelled':
        return 'Ride was cancelled';
      default:
        return 'No active trip currently booked';
    }
  };

  const handleNavigate = (rideId, status) => {
    if(!rideId) return
    if (status === 'Pending') {
      return;
    } else {
      navigation.navigate('Bookings', {
        screen: 'RideConfirmationScreen',
        params: { rideId },
      });
    }
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + 10 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <UserHeader />

          {/* Yellow CTA Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Bookings')}
            style={styles.ctaCard}
          >
            <View>
              <Text style={styles.ctaTitle}>Book a Chauffeur</Text>
              <Text style={styles.ctaSubtitle}>
                Instant or Scheduled Luxury
              </Text>
            </View>
            <Icon name="chevron-forward" size={wp('8%')} color="#000" />
          </TouchableOpacity>

          {/* Current Ride Status */}
          <TouchableOpacity
            onPress={() =>
              handleNavigate(data?.data?._id, data?.data?.ride_status)
            }
            style={styles.rideStatusCard}
          >
            <Text style={styles.sectionTitle}>Current Ride Status</Text>
            <View style={styles.statusRow}>
              {/* // data?.data?._id  ride id if active.... */}
              {data?.data?._id ? (
                <View style={{ flexDirection: 'row' }}>
                  <Icon
                    name="checkmark-circle-sharp"
                    size={wp('5%')}
                    color={COLORS.success}
                  />

                  <Text style={[styles.statusText, { color: COLORS.success }]}>
                    {getRideStatusText(data?.data?.ride_status)}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row' }}>
                  <Icon name="time-outline" size={wp('5%')} color="#666" />
                  <Text style={styles.statusText}>{getRideStatusText()}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Loyalty & Offers - Slider */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loyalty & Offers</Text>
            <FlatList
              ref={flatListRef}
              data={loyaltyData}
              renderItem={renderLoyaltyCard}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              snapToInterval={wp('90%')}
              decelerationRate="fast"
              contentContainerStyle={styles.sliderContainer}
            />
          </View>

          {/* Quick Destinations */}
            {Array.isArray(data?.quick_destination) && data?.quick_destination?.length >0  && (
              
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Destinations</Text>
              {data?.quick_destination?.map(des => (
                <View key={des?._id} style={styles.destinationCard}>
                  <View>
                    <Text style={styles.destinationTitle}>
                      {des?.pickup_location?.famous_location}
                    </Text>
                    <Text style={styles.destinationSubtitle}>
                      Last Trip: {formatSmartDate(des?.ride_complete_at)} |{' '}
                      {des?.distance}
                    </Text>
                  </View>
                  {/* <Icon name="chevron-forward" size={wp('5%')} color="#666" /> */}
                  <TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#FFD700',
                        fontFamily: 'Poppins-Regular',
                      }}
                    >
                      Book Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
  )}

          {/* Bottom spacing to prevent content hiding behind tab bar */}
        </ScrollView>
      </View>
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

  ctaCard: {
    backgroundColor: '#FFD700',
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '1px solid rgba(17, 17, 17, 0.10)',
    padding: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  ctaTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  ctaSubtitle: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: '400',

    fontFamily: 'Poppins-Regular',
  },
  rideStatusCard: {
    backgroundColor: '#fff',
    boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: '1px solid rgba(17, 17, 17, 0.10)',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1.5%'),
    fontFamily: 'Poppins-Regular',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: wp('2%'),
    fontFamily: 'Poppins-Regular',
  },
  section: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  sliderContainer: {
    paddingRight: wp('5%'),
  },
  loyaltyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('85%'),
    marginRight: wp('3%'),
    fontFamily: 'Poppins-Regular',
  },
  loyaltyContent: {
    flex: 1,
  },
  loyaltyBadge: {
    fontSize: wp('2.8%'),
    color: '#FFD700',
    marginBottom: hp('1%'),
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  loyaltyPoints: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginBottom: hp('0.5%'),
  },
  loyaltySubtext: {
    fontSize: wp('3%'),
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  loyaltyRight: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    alignItems: 'center',
  },
  loyaltyRightText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  loyaltyRightSubtext: {
    fontSize: wp('2.5%'),
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1.5%'),
  },
  paginationDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: '#ccc',
    marginHorizontal: wp('1%'),
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
    width: wp('6%'),
  },
  destinationCard: {
    backgroundColor: '#fff',
    boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',
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
});
