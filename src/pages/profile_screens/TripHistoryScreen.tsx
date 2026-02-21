// @ts-nocheck
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useInfiniteQuery } from '@tanstack/react-query';
import AppLoader from '../../components/AppLoader';

export const TripHistoryScreen = ({ navigation }) => {
  const tabBarHeight = useTabBarHeightHelper();

  // ✅ Infinite query with pagination
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['user-trip'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchData(`/ride/trip-history?page=${pageParam}`);
      return res;
    },
    getNextPageParam: lastPage => {
      const { currentPage, totalPages } = lastPage || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
  });

  // ✅ Flatten paginated results
  const trips = data?.pages.flatMap(page => page?.data || []) || [];

  // ✅ Infinite scroll handler
  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
      if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Trip History" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 50 },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ✅ Render Trip Cards */}
        {trips.length > 0 ? (
          trips.map(trip => {
            const pickup = trip.pickup_location?.address || 'N/A';
            const dropoff = trip.drop_location?.address || 'N/A';
            const fare =
              trip.payment_breakdown?.total_fare?.toFixed(2) || '0.00';

            return (
              <View key={trip._id} style={styles.tripCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.dateText}>Completed Trip</Text>
                    <Text style={styles.priceText}>${fare}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>

                {/* Itinerary */}
                <View style={styles.itineraryContainer}>
                  <View style={styles.line} />
                  <View style={[styles.dot, styles.pickupDot]} />
                  {/* <View style={[styles.dot, styles.dropoffDot]} /> */}

                  <View style={styles.locationDetails}>
                    <View style={{ marginBottom: hp(2.5) }}>
                      <Text style={styles.locationTitle}>Pickup</Text>
                      <Text style={styles.locationSub}>{pickup}</Text>
                    </View>
                    {/* <View>
                      <Text style={styles.locationTitle}>Drop-off</Text>
                      <Text style={styles.locationSub}>{dropoff}</Text>
                    </View> */}
                  </View>
                </View>

                {/* View Details Button */}

                <Button
                  onPress={() =>
                    navigation.navigate('TripReceipt', {
                      tripId: trip._id,
                    })
                  }
                  title="View Receipt & Details"
                />
              </View>
            );
          })
        ) : (
          <Text
            style={{ textAlign: 'center', color: '#777', marginTop: hp(5) }}
          >
            No trip history available
          </Text>
        )}

        {/* ✅ Pagination Loader */}
        {isFetchingNextPage && (
          <ActivityIndicator
            size="small"
            color="#000"
            style={{ marginVertical: hp(2) }}
          />
        )}

        <View style={{ height: hp(5) }} />
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
    fontFamily: 'SF Pro',
  },
  priceText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hp(0.5),
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
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
    fontFamily: 'SF Pro',
  },
});
