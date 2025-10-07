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

const { width } = Dimensions.get('window');

export default function RideCompletedScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  return (
        <KeyboardAvoidingView style={{flex: 1}}>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Completed</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Success Icon */}
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={wp('15%')} color="#fff" />
            </View>
            <Text style={styles.successTitle}>You've Arrived!</Text>
            <Text style={styles.successSubtitle}>
              555 Luxury Tower, Cleanfield
            </Text>
          </View>

          {/* Final Trip Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Final Trip Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>29 min</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Distance:</Text>
              <Text style={styles.summaryValue}>12.7 miles</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Base Fare:</Text>
              <Text style={styles.summaryValue}>$70.00</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & Fees:</Text>
              <Text style={styles.summaryValue}>$8.95</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Charged:</Text>
              <Text style={styles.totalValue}>$78.95</Text>
            </View>
          </View>

          {/* Rate Your Chauffeur */}
          <View style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>Rate Your Chauffeur</Text>

            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitials}>JD</Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>John Davis</Text>
                <Text style={styles.driverCar}>Mercedes S-Class · CHZ-1234</Text>
              </View>
            </View>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
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
          </View>
        </ScrollView>

        {/* Pay Now Button */}
        <View style={styles.bottomContainer}>
          <Button title='Pay Now'  onPress={()=>navigation.navigate('PaymentSummaryScreen')}/>

     

        </View>
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
  },
  backButton: {
    marginRight: wp('3%'),
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
  },
  successSubtitle: {
    fontSize: wp('3.5%'),
    color: '#888',
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
  },
  summaryValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
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
  },
  totalValue: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#000',
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
    minHeight: hp('6%'),
  },
  bottomContainer: {
    backgroundColor: '#F5F5F5',
    paddingTop: hp('1%'),
    marginBottom: hp(10),
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
    marginBottom: hp('1.5%'),
  },
  payButtonText: {
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