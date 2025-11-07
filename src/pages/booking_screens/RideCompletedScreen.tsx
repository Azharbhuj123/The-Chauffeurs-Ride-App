// @ts-nocheck
// Screen 1: Ride Complete Summary

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { useUserStore } from '../../stores/useUserStore';

const { width } = Dimensions.get('window');

export default function RideCompletedScreen({ navigation, route }) {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const { rideId } = route.params || {};
  const tabBarHeight = useTabBarHeightHelper();
  const {userData} = useUserStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ride_view', rideId],
    queryFn: () => fetchData(`/ride/${rideId}`),
    keepPreviousData: true,
    enabled: !!rideId,
  });

  const payment_breakdown = data?.data?.payment_breakdown;

const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
        // Reset the Booking stack completely
        navigation.reset({
          index: 0,
          routes: [{ name: 'Bookings' }], // 👈 take user to Home first
        });

        // Optionally also reset the Booking stack when user revisits it
        setTimeout(() => {
          navigation.navigate('Bookings', {
            screen: 'BookingMain', // 👈 start fresh page 1
          });
        }, 300);
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleReview = () =>{
    if(rating === 0){
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Please fill out all fields',
      })

      return;
    }
 

    const data_obj = {
      user:userData?._id,
      rating: rating,
      comment: note,
      ride: rideId,
      driver: data?.data?.driver?._id
    };

 
    

triggerMutation({
      endPoint: '/review/',
      body: data_obj,
      method: 'post',
    });





  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.container,
            {
              paddingBottom:
                data?.data?.payment_method === 'Card'
                  ? tabBarHeight + hp(2)
                  : tabBarHeight + hp(7),
            },
          ]}
        >
          {/* Header */}

          <TopHeader
            title="Ride Completed"
            navigation={navigation}
            any_navigation={true}
            navigate_to="Home"
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent]}
          >
            {/* Success Icon */}
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={wp('15%')} color="#fff" />
              </View>
              <Text style={styles.successTitle}>You've Arrived!</Text>
              <Text style={styles.successSubtitle}>
                {data?.data?.pickup_location?.address}
              </Text>
            </View>

            {/* Final Trip Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Final Trip Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}> {data?.data?.duration}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Distance:</Text>
                <Text style={styles.summaryValue}>{data?.data?.distance}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Base Fare:</Text>
                <Text style={styles.summaryValue}>
                  ${payment_breakdown?.driver_earning?.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes & Fees:</Text>
                <Text style={styles.summaryValue}>
                  ${payment_breakdown?.platform_fee?.toFixed(2)}
                </Text>
              </View>
              {payment_breakdown?.dispatch_fee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Dispatch Fees:</Text>
                  <Text style={styles.summaryValue}>
                    ${payment_breakdown?.dispatch_fee}
                  </Text>
                </View>
              )}
              {payment_breakdown?.referral_fee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Referral Fees:</Text>
                  <Text style={styles.summaryValue}>
                    ${payment_breakdown?.referral_fee}
                  </Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Charged:</Text>
                <Text style={styles.totalValue}>
                  ${payment_breakdown?.total_fare?.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Rate Your Chauffeur */}
            <View style={styles.ratingCard}>
              <Text style={styles.sectionTitle}>Rate Your Chauffeur</Text>

              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Image
                    source={{ uri: data?.data?.driver?.profile_image }}
                    style={{ width: '100%', height: '100%', borderRadius: 50 }}
                  />
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>
                    {data?.data?.driver?.name}
                  </Text>
                  <Text style={styles.driverCar}>
                    {data?.data?.vehicle?.vehicle_make}{' '}
                    {data?.data?.vehicle?.vehicle_model} ·{' '}
                    {data?.data?.vehicle?.vehicle_plate_number}
                  </Text>
                </View>
              </View>

              {/* Star Rating */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={wp('8%')}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Optional Note */}
              <TextInput
                style={styles.noteInput}
                placeholder="Add Optional Note"
                placeholderTextColor="#999"
                value={note}
                onChangeText={setNote}
                multiline
              />
              
              <Button isLoading={loading} title='Submit' onPress={handleReview}/>
            </View>
          </ScrollView>
          {data?.data?.payment_method === 'Card' && (
            <View style={styles.bottomContainer}>
              <Button
                title="Pay Now"
                onPress={() =>
                  navigation.navigate('PaymentSummaryScreen', {
                    total_fare: payment_breakdown?.total_fare?.toFixed(2),
                    base_fare: payment_breakdown?.driver_earning?.toFixed(2),
                    platform_fee: payment_breakdown?.platform_fee?.toFixed(2),
                    rideId,
                  })
                }
              />
            </View>
          )}

          {/* Pay Now Button */}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  backButton: {
    marginRight: wp('3%'),
    fontFamily: 'SF Pro',
  },

  scrollContent: {
    paddingBottom: hp('2%'),
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
  },
  successIcon: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  successTitle: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp('0.5%'),
    fontFamily: 'SF Pro',
  },
  successSubtitle: {
    fontSize: wp('3.5%'),
    color: '#888',
    fontFamily: 'SF Pro',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('5%'),
    borderRadius: wp('4%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('2%'),
    fontFamily: 'SF Pro',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
  },
  summaryLabel: {
    fontSize: wp('3.8%'),
    color: '#888',
    fontFamily: 'SF Pro',
  },
  summaryValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: hp('1%'),
    paddingTop: hp('1.5%'),
  },
  totalLabel: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  totalValue: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  ratingCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('5%'),
    borderRadius: wp('4%'),
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  driverAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  driverInitials: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#000',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('0.3%'),
    fontFamily: 'SF Pro',
  },
  driverCar: {
    fontSize: wp('3.3%'),
    color: '#888',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp('2%'),
    marginVertical: hp('2%'),
  },
  starButton: {
    padding: wp('1%'),
  },
  noteInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    fontSize: wp('3.8%'),
    color: '#000',
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
    minHeight: hp('6%'),
    fontFamily: 'SF Pro',
  },
  bottomContainer: {
    backgroundColor: '#F5F5F5',
    paddingTop: hp('1%'),
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  payButton: {
    backgroundColor: '#FFD700',
    marginHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    fontFamily: 'SF Pro',

    marginBottom: hp('1.5%'),
  },
  payButtonText: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('8%'),
    justifyContent: 'space-around',
    alignItems: 'center',
    fontFamily: 'SF Pro',
  },
  navItem: {
    padding: wp('2%'),
    fontFamily: 'SF Pro',
  },
  navItemActive: {
    backgroundColor: '#FFD700',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('2%'),
    fontFamily: 'SF Pro',
  },
});
