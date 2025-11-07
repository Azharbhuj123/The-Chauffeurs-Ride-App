// @ts-nocheck
// Screen 2: Ride Complete Payment Summary

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';

const { width, height } = Dimensions.get('window');

export default function PaymentSummaryScreen({ navigation, route }) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');

  const { rideId, total_fare, base_fare, platform_fee } = route.params || {};

  const tipOptions = [
    { label: '$11.84 (15%)', value: 11.84, percentage: 15 },
    { label: '$15.79 (20%)', value: 15.79, percentage: 20 },
    { label: '$19.74 (25%)', value: 19.74, percentage: 25 },
  ];

  const baseAmount = total_fare;

  const getTipAmount = () => {
    if (customTip) {
      const tipValue = parseFloat(customTip);
      return isNaN(tipValue) ? 0 : tipValue;
    }
    if (selectedTip) return selectedTip.value;
    return 0; // default tip
  };

  const calculateTotal = () => {
    const base = Number(baseAmount) || 0; // ensure number
    const tip = Number(getTipAmount()) || 0; // ensure number
    const total = base + tip;
    return total.toFixed(2);
  };

  const handleTipSelect = tip => {
    setSelectedTip(tip);
    setCustomTip(''); // clear custom tip when selecting predefined tip
  };

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        showToast({
          type: 'success',
          title: 'Payment Success',
          message: data?.message || 'Payment completed successfully!',
        });

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
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleProcessPayment = () => {
    const tip = getTipAmount();
    const total = calculateTotal();
    const data = {
      ride_id: rideId,
      driver_tip: tip,
      total_fare: total,
    };

    triggerMutation({
      endPoint: '/ride/ride-payment',
      body: data,
      method: 'post',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}

        <TopHeader title="Ride Completed" navigation={navigation} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Total Charge Due */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TOTAL CHARGE DUE</Text>
            <Text style={styles.totalAmount}>${baseAmount}</Text>
            <Text style={styles.fareBreakdown}>
              Base Fare: ${base_fare} | Fees: ${platform_fee}
            </Text>
          </View>

          {/* Payment Method */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Method</Text>

            <View style={styles.paymentMethodBox}>
              <View style={styles.paymentRow}>
                <Ionicons name="card-outline" size={wp('5%')} color="#888" />
                <Text style={styles.paymentText}>Visa ending in **5432</Text>
              </View>
              <Text style={styles.defaultBadge}>Default</Text>
            </View>

            <TouchableOpacity style={styles.changeButton}>
              <Feather
                name="plus-circle"
                size={wp('5%')}
                color="#000"
                style={styles.changeIcon}
              />
              <Text style={styles.changeText}>Change Payment Method</Text>
            </TouchableOpacity>
          </View>

          {/* Tip Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add a Tip for John Davis</Text>

            <View style={styles.tipOptionsContainer}>
              {tipOptions.map((tip, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tipButton,
                    selectedTip?.percentage === tip.percentage &&
                      styles.tipButtonSelected,
                  ]}
                  onPress={() => handleTipSelect(tip)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      selectedTip?.percentage === tip.percentage &&
                        styles.tipButtonTextSelected,
                    ]}
                  >
                    {tip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customTipBox}>
              <TextInput
                placeholder="$15.79"
                placeholderTextColor="#999"
                style={styles.customTipAmount}
                value={customTip}
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9.]/g, ''); // allow only numbers and "."
                  setCustomTip(cleaned);
                  setSelectedTip(null); // clear predefined tip when custom is entered
                }}
              />
            </View>
          </View>

          {/* Final Charge */}
          <View style={styles.finalChargeContainer}>
            <Text style={styles.finalChargeLabel}>Final Charge:</Text>
            <Text style={styles.finalChargeAmount}>${calculateTotal()}</Text>
          </View>
        </ScrollView>

        {/* Process Payment */}
        <View style={styles.bottomContainer}>
          <Button
            isLoading={loading}
            title={`PROCESS PAYMENT - $${calculateTotal()}`}
            onPress={handleProcessPayment}
          />
        </View>
      </View>
    </SafeAreaView>
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
  },
  backButton: {
    marginRight: wp('3%'),
  },
  scrollContent: {
    paddingBottom: hp('2%'),
  },
  totalCard: {
    backgroundColor: '#FFD700',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('6%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1%'),
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: wp('10%'),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  fareBreakdown: {
    fontSize: wp('3.3%'),
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('5%'),
    borderRadius: wp('4%'),
  },
  cardTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('2%'),
  },
  paymentMethodBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  paymentText: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
  },
  defaultBadge: {
    fontSize: wp('3.2%'),
    color: '#FFD700',
    fontWeight: '600',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.2%'),
    boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.10)',
    borderRadius: 10,
  },
  changeIcon: {
    marginRight: wp('2%'),
  },
  changeText: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
  },
  tipOptionsContainer: {
    flexDirection: 'row',
    gap: wp('2.5%'),
    marginBottom: hp('2%'),
  },
  tipButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tipButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  tipButtonText: {
    fontSize: wp('3.2%'),
    color: '#666',
    fontWeight: '500',
  },
  tipButtonTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  customTipBox: {
    backgroundColor: '#F8F8F8',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  customTipAmount: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
  finalChargeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('5%'),
    borderRadius: wp('4%'),
  },
  finalChargeLabel: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#000',
  },
  finalChargeAmount: {
    fontSize: wp('6.5%'),
    fontWeight: '700',
    color: '#000',
  },
  bottomContainer: {
    backgroundColor: '#F5F5F5',
    paddingTop: hp('1%'),
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: hp(12),
  },
  processButton: {
    backgroundColor: '#FFD700',
    marginHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  processButtonText: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#000',
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
  },
  navItem: {
    padding: wp('2%'),
  },
  navItemActive: {
    backgroundColor: '#FFD700',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('2%'),
  },
});
