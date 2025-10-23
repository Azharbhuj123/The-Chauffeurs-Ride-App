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
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import CancelRide from '../booking_screens/CancelRide';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';

export default function ReportIssue({ navigation }) {
      const tabBarHeight = useTabBarHeightHelper();
    
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Report an Issue" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
             contentContainerStyle={[styles.scrollContent,{ paddingBottom: tabBarHeight + 35 }]}

      >
        <View style={styles.forContainer}>
          {/* Top Payment Card */}
          <View style={styles.paymentCard}>
            <Text style={styles.issueLabel}>Issue for Trip</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.tripId}>Trip ID: #T55829</Text>
              <Text style={styles.amount}>$42.50</Text>
            </View>

            <View style={styles.dashedLine} />
            <Text style={styles.dateLoc}>
              Oct 1, 2025 | Innovation Hub to Palm View Towers
            </Text>
          </View>
        </View>
        <CancelRide headerShow={false} btnText="Submit Complain" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
  },
  forContainer: {
    paddingHorizontal: wp('5%'),
    marginBottom: hp(Platform.OS === 'ios' ? 0 : 8),
  },
  // Card Styles
  paymentCard: {
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 12,
    padding: wp(5),
  },

  issueLabel: {
    fontSize: wp(5),
    color: '#000',
  },

  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  tripId: {
    color: 'rgba(17, 17, 17, 0.70)',
  },
  amount: {
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: hp(2),
  },
  dateLoc: {
    fontSize: wp(3),

    color: 'rgba(17, 17, 17, 0.70)',
  },
});
