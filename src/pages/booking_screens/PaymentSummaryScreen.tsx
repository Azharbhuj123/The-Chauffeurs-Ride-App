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
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { COLORS, STRIPE_PUBLISH_KEY } from '../../utils/Enums';
import axios from 'axios';
import base_url from '../../utils/BaseUrl';
import { useUserStore } from '../../stores/useUserStore';

const { width, height } = Dimensions.get('window');

// ─── Inner Screen (useStripe hook sirf StripeProvider ke andar kaam karta hai) ───
function PaymentSummaryContent({ navigation, route }) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { token } = useUserStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

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
    return 0;
  };

  const calculateTotal = () => {
    const base = Number(baseAmount) || 0;
    const tip = Number(getTipAmount()) || 0;
    return (base + tip).toFixed(2);
  };

  const handleTipSelect = tip => {
    setSelectedTip(tip);
    setCustomTip('');
  };

  // ─── Step 1: Backend se client_secret lo, Step 2: Sheet kholo ────────────
  const handleProcessPayment = async () => {
    setPaymentLoading(true);

    try {
      const tip = getTipAmount();
      const total = calculateTotal();

      // ── 1. Create PaymentIntent ──────────────────
      const { data } = await axios({
        method: 'post',
        url: `${base_url}/stripe/create-payment-intent`,
        data: { ride_id: rideId, driver_tip: tip, total_fare: total },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to initialize payment');
      }

      const { client_secret, breakdown } = data.data;

      // ── 2. Initialize Payment Sheet ───────────────────────
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: client_secret,
        merchantDisplayName: 'Drivo',
        style: 'alwaysLight',
        appearance: {
          colors: {
            primary: COLORS.warning,
            background: '#FFFFFF',
            primaryText: '#000000',
            secondaryText: '#666666',
            icon: COLORS.warning, // Icons like the Card icon
          },
        },
      });

      if (initError) throw new Error(initError.message);

      // ── 3. Present Payment Sheet ───────────
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          setPaymentLoading(false);
          return;
        }
        throw new Error(presentError.message);
      }

      // ── 4. SUCCESS: Now call your ride-payment API ─────
      // Note: We send the 'breakdown' we got from the first API call
      const response = await axios({
        method: 'post',
        url: `${base_url}/stripe/ride-payment`,
        data: {
          breakdown: {
            ...breakdown,
            ride_id: rideId,
          },
        }, // Wrapping it in breakdown as your backend expects
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        showToast({
          type: 'success',
          title: 'Payment Successful',
          message: 'Your ride has been paid successfully!',
        });
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Bookings',
              state: {
                routes: [{ name: 'BookingMain' }],
              },
            },
          ],
        });
      }
    } catch (err) {
      console.log('❌ Payment Error:', err);
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: err.message || 'Something went wrong',
      });
    } finally {
      setPaymentLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
                keyboardType="decimal-pad"
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setCustomTip(cleaned);
                  setSelectedTip(null);
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

        {/* Process Payment Button */}
        <View style={styles.bottomContainer}>
          <Button
            isLoading={paymentLoading}
            title={`PROCESS PAYMENT - $${calculateTotal()}`}
            onPress={handleProcessPayment}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Wrapper: StripeProvider har jagah hona chahiye jahan useStripe use ho ───
export default function PaymentSummaryScreen({ navigation, route }) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISH_KEY} // ← apni key
      merchantIdentifier="merchant.com.drivo" // sirf iOS Apple Pay ke liye
    >
      <PaymentSummaryContent navigation={navigation} route={route} />
    </StripeProvider>
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
  scrollContent: {
    paddingBottom: hp('2%'),
  },
  totalCard: {
    backgroundColor: COLORS.warning,
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('6%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: wp('3.2%'),
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginBottom: hp('2%'),
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
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  tipButtonText: {
    fontSize: wp('3.2%'),
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  tipButtonTextSelected: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  customTipBox: {
    backgroundColor: '#F8F8F8',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  customTipAmount: {
    fontSize: wp('4.5%'),
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
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
});
