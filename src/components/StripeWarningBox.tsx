import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useUserStore } from '../stores/useUserStore';
import { useStripeStore } from '../stores/stripeStore';

const StripeWarningBox = () => {
  const { token: authToken } = useUserStore();

  const startConnect = useStripeStore(s => s.startConnect);
  const connectState = useStripeStore(s => s.connectState);

  const handleConnect = useCallback(() => {
    if (!authToken) return;
    console.log(authToken, 'authToken', 'startConnect');

    startConnect(authToken);
  }, [authToken, startConnect]);
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Image
            source={{
              uri: 'https://drivobucket.s3.us-east-2.amazonaws.com/TheDrivo-uploads/f9a218bc-b6b8-4c12-ac3b-12515aa06c62.png',
            }}
            style={styles.stripeLogo}
            resizeMode="contain"
          />
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>Action Required</Text>
          </View>
        </View>

        <Text style={styles.description}>
          To receive car bookings and process payments, you must connect your
          account with Stripe. Unconnected accounts will remain inactive.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.connectButton}
          onPress={handleConnect}
        >
          <Text style={styles.buttonText}>Connect with Stripe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: wp('5%'),
    marginTop: hp('1%'),
    marginBottom: hp('3%'),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    borderWidth: 1.5,
    borderColor: '#FF3B30', // Warning Red
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  stripeLogo: {
    width: wp('12%'),
    height: hp('4%'),
  },
  warningBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1%'),
  },
  warningBadgeText: {
    color: '#FF3B30',
    fontSize: wp('3%'),
    // fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'Poppins-Regular',
  },
  description: {
    fontSize: wp('3.3%'),
    color: '#4A4A4A',
    lineHeight: wp('5.5%'),
    marginBottom: hp('2.5%'),
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  connectButton: {
    backgroundColor: '#635BFF', // Official Stripe Purple
    height: hp('6%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontStyle: 'italic',
    fontWeight: '600',
  },
});

export default StripeWarningBox;
