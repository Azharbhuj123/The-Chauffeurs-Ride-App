// @ts-nocheck

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const fs = (size) => {
  return Math.sqrt((height * height) + (width * width)) * (size / 1000);
};

export default function NotificationsAlerts({ navigation }) {
  const [deliveryMethod, setDeliveryMethod] = useState(true);
  const [newRideRequests, setNewRideRequests] = useState(true);
  const [rideCancellations, setRideCancellations] = useState(true);
  const [paymentUpdates, setPaymentUpdates] = useState(true);
  const [systemAnnouncements, setSystemAnnouncements] = useState(true);

  const alertHistory = [
    {
      id: 1,
      type: 'payment',
      icon: '💰',
      bgColor: '#F8D833',
      title: 'Payment Alert',
      description: 'Weekly payout initiated successfully.',
      date: '2024-10-18 14:30',
    },
    {
      id: 2,
      type: 'system',
      icon: '⚙️',
      bgColor: '#F8D833',
      title: 'System Alert',
      description: 'New app update (v2.1) deployed.',
      date: '2024-10-12 10:00',
    },
    {
      id: 3,
      type: 'cancellation',
      icon: '✕',
      bgColor: '#F8D833',
      title: 'Cancellation Alert',
      description: 'Ride ID #9876 cancelled by passenger.',
      date: '2024-10-11 16:45',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Notifications & Alerts" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Delivery Method:</Text>
            <Switch
              value={deliveryMethod}
              onValueChange={setDeliveryMethod}
              trackColor={{ false: '#E0E0E0', true: '#F8D833' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </View>

        {/* Alert Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Toggles</Text>
          
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>New Ride Requests</Text>
            <Switch
              value={newRideRequests}
              onValueChange={setNewRideRequests}
              trackColor={{ false: '#E0E0E0', true: '#F8D833' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Ride Cancellations</Text>
            <Switch
              value={rideCancellations}
              onValueChange={setRideCancellations}
              trackColor={{ false: '#E0E0E0', true: '#F8D833' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Payment Updates</Text>
            <Switch
              value={paymentUpdates}
              onValueChange={setPaymentUpdates}
              trackColor={{ false: '#E0E0E0', true: '#F8D833' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>System Announcements</Text>
            <Switch
              value={systemAnnouncements}
              onValueChange={setSystemAnnouncements}
              trackColor={{ false: '#E0E0E0', true: '#F8D833' }}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </View>

        {/* Alert History */}
        <View style={[styles.section,styles.lastSec]}>
          <Text style={styles.sectionTitle}>Alert History</Text>
          
          {alertHistory.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={[styles.iconContainer, { backgroundColor: alert.bgColor }]}>
                <Text style={styles.iconText}>{alert.icon}</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <Text style={styles.alertDate}>{alert.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingHorizontal: wp(4.3),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  section: {
    marginBottom: hp(3),
  },
  lastSec:{
    marginBottom: hp(8),

  },
  sectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(1.5),
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: fs(14),
    color: '#333',
    fontWeight: '400',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,

  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  iconText: {
    fontSize: fs(20),
  },
  alertContent: {
    flex: 1,
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: fs(15),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.3),
  },
  alertDescription: {
    fontSize: fs(13),
    color: '#666',
    marginBottom: hp(0.3),
  },
  alertDate: {
    fontSize: fs(11),
    color: '#999',
  },
});