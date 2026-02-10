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
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import AppLoader from '../../components/AppLoader';
import { formatReadableDate } from '../../utils/DateFormats';
import { COLORS } from '../../utils/Enums';

export const TripReceiptScreen = ({ navigation, route }) => {
  const tabBarHeight = useTabBarHeightHelper();
  const { tripId } = route.params || {};

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-history-id', tripId],
    queryFn: () => fetchData(`/ride/trip-history/${tripId}`),
    keepPreviousData: true,
  });

  const ride_detail = data?.data;
  const ride_detail_payment = data?.data?.payment_breakdown;
  console.log(ride_detail, 'ajajajajajajajaj');

  // Helper component for Fare Breakdown and Trip Summary rows
  const DetailRow = ({ label, value, valueStyle }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
  );

  const final_amount = (
    Number(ride_detail_payment?.total_fare || 0) +
    Number(ride_detail_payment?.driver_tip || 0)
  ).toFixed(2);

  if(isLoading) {
    return <AppLoader/>
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Trip Receipt" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 50 },
        ]}
      >
        {/* Top Payment Card */}
        <View style={styles.paymentCard}>
          <Text style={styles.totalPaidLabel}>Total Paid</Text>
          <Text style={styles.totalPaidAmount}>${final_amount}</Text>
          <Text style={styles.paymentMethod}>Paid via {ride_detail?.payment_method}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>
          <DetailRow label="Date & Time" value={formatReadableDate(ride_detail?.ride_complete_at)} />
          <DetailRow label="Vehicle Class" value={`${ride_detail?.vehicle?.vehicle_make} (${ride_detail?.vehicle?.vehicle_model})`} />
          <DetailRow label="Distance" value={`${ride_detail?.distance}`} />

          {/* Itinerary */}
          <View style={styles.itineraryContainer}>
            <View style={styles.line} />
            <View style={[styles.dot, styles.pickupDot]} />
            <View style={[styles.dot, styles.dropoffDot]} />
            <View style={styles.locationDetails}>
              <View style={{ marginBottom: hp(2) }}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationValue}>
                  {ride_detail?.pickup_location?.address}
                </Text>
              </View>
              <View>
                <Text style={styles.locationLabel}>Drop-off Location</Text>
                <Text style={styles.locationValue}>
                                   {ride_detail?.drop_location?.address}

                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          <DetailRow label="Base Fare" value={ride_detail_payment?.driver_earning} />
          <DetailRow label="Taxes & Tolls" value={ride_detail_payment?.platform_fee} />
          {ride_detail_payment?.driver_tip > 0 && (
            <DetailRow label="Driver Tip" value={ride_detail_payment?.driver_tip} />
          )}

          <View style={styles.dashedLine} />

          <DetailRow
            label="Total Amount"
            value={final_amount}
            valueStyle={styles.finalAmountValue}
          />
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <Text style={styles.sectionTitle}>Driver & Service</Text>
          <View style={styles.driverInfoContainer}>
            <Image
              source={{ uri: ride_detail?.driver?.profile_image }} // Placeholder image
              style={styles.driverImage}
            />
            <View style={styles.driverTextContainer}>
              <Text style={styles.driverName}>Driver Name</Text>
              <Text style={styles.driverPlate}>{ride_detail?.driver?.name} (Plate: {ride_detail?.vehicle?.vehicle_plate_number})</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={wp(4)} color="#FDD835" />
                <Text style={styles.ratingText}>{ride_detail?.driver?.rating?.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.downloadButton} activeOpacity={0.8}>
            <Button title="Download Receipt" />
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
    backgroundColor: COLORS.warning,
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
