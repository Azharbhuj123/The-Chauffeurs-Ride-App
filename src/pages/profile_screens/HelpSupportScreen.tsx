// @ts-nocheck

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
 
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader'; // Assuming TopHeader is in a components folder
import { SafeAreaView } from 'react-native-safe-area-context';

export const HelpSupportScreen = ({ navigation }) => {
  const helpTopics = [
    'Issues with a Trip',
    'Payment, Billing, or Receipts',
    'Account, Login, or Profile Updates',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Help & Support" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Help Topics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Help Topics</Text>
          {helpTopics.map((topic, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.row} activeOpacity={0.6}>
                <Text style={styles.rowText}>{topic}</Text>
                <Ionicons name="chevron-forward-outline" style={styles.chevron} />
              </TouchableOpacity>
              {index < helpTopics.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Immediate Assistance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need Immediate Assistance?</Text>
          <TouchableOpacity style={styles.contactRow} activeOpacity={0.6}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles-outline" style={styles.contactIcon} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactTitle}>Chat with Support (24/7)</Text>
              <Text style={styles.contactSubtitle}>Fastest response time</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.contactRow} activeOpacity={0.6}>
            <View style={styles.iconContainer}>
              <Ionicons name="call-outline" style={styles.contactIcon} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactTitle}>Call Support</Text>
              <Text style={styles.contactSubtitle}>Mon - Fri, 9:00 AM - 5:00 PM</Text>
            </View>
          </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: hp('1%'),
    marginBottom: hp('2.5%'),
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('1%'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  rowText: {
    fontSize: wp('4%'),
    color: '#333',
  },
  chevron: {
    fontSize: wp('5%'),
    color: '#ccc',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: wp('4%'),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  iconContainer: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#FDD835',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: wp('5%'),
    color: '#000',
  },
  contactTextContainer: {
    marginLeft: wp('4%'),
  },
  contactTitle: {
    fontSize: wp('4%'),
    color: '#000',
    fontWeight: '600',
  },
  contactSubtitle: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.3%'),
  },
});