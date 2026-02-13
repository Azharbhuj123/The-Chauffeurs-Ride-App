// @ts-nocheck

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import AppLoader from '../../components/AppLoader';
import { useFocusEffect } from '@react-navigation/native';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { COLORS } from '../../utils/Enums';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function NotificationsAlerts({ navigation }) {
  const [deliveryMethod, setDeliveryMethod] = useState(true);
  const [newRideRequests, setNewRideRequests] = useState(true);
  const [rideCancellations, setRideCancellations] = useState(true);
  const [paymentUpdates, setPaymentUpdates] = useState(true);
  const [systemAnnouncements, setSystemAnnouncements] = useState(true);
  const tabBarHeight = useTabBarHeightHelper();

  const { data, isLoading } = useQuery({
    queryKey: ['alert-history'],
    queryFn: () => fetchData('/driver/alert-history'),
    keepPreviousData: true,
  });

  const {
    data: notify,
    isLoading: notifyLoading,
    refetch,
  } = useQuery({
    queryKey: ['notify-history'],
    queryFn: () => fetchData('/driver/my-notify-permissions'),
    keepPreviousData: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  console.log(notify, 'notify');

  useEffect(() => {
    if (notify?.data && notify?.data?.notificationsPermissions) {
      const notifyData = notify?.data?.notificationsPermissions;
      setNewRideRequests(notifyData?.new_ride);
      setRideCancellations(notifyData?.ride_cancel);
      setPaymentUpdates(notifyData?.pay_update);
      setSystemAnnouncements(notifyData?.system_announcment);
    }
  }, [notify]);

  const alertHistorys = Array.isArray(data?.alert_history)
    ? data.alert_history
    : [];

  const alertIcons = {
    system_alert: '⚙️',
    payment_alert: '💰',
    cancel_alert: '✕',
  };

  const alertColors = {
    system_alert: COLORS.warning,
    payment_alert: '#4CAF50',
    cancel_alert: '#FF6B6B',
  };

  const alertHistory = alertHistorys?.map((item, index) => {
    const typeKey = item.type?.toLowerCase() || 'system_alert';
    return {
      id: index + 1,
      type: item.type,
      icon: alertIcons[typeKey] || '🔔',
      bgColor: alertColors[typeKey] || COLORS.warning,
      title: item.title || 'System Alert',
      description: item.message || 'No description available.',
      date: new Date(item.createdAt).toLocaleString(),
    };
  });

  // -------------------
  // Mutation hook
  // -------------------
  const { triggerMutation, loading: mutationLoading } = useActionMutation({
    onSuccessCallback: async data => {
      // refresh local permission state from server (if needed)
      refetch();
      // Optional toast:
      // showToast({ type: 'success', title: 'Success', message: 'Preferences updated' });
      console.log('notify prefs updated', data);
    },
    onErrorCallback: errmsg => {
      // Re-fetch to restore previous (server) state or handle rollback
      refetch();
      // Optional toast:
      // showToast({ type: 'error', title: 'Update Failed', message: errmsg || 'Please try again' });
      console.log('failed to update notify prefs', errmsg);
    },
  });

  // Helper that builds the full payload using the most recent local values,
  // but swaps the target key with the new value (optimistic UI).
  const buildPayload = (changedKey, changedValue) => ({
    new_ride:
      changedKey === 'new_ride' ? changedValue : Boolean(newRideRequests),
    ride_cancel:
      changedKey === 'ride_cancel' ? changedValue : Boolean(rideCancellations),
    pay_update:
      changedKey === 'pay_update' ? changedValue : Boolean(paymentUpdates),
    system_announcment:
      changedKey === 'system_announcment'
        ? changedValue
        : Boolean(systemAnnouncements),
  });

  const handleToggle = (key, value) => {
    // optimistic UI update
    if (key === 'new_ride') setNewRideRequests(value);
    if (key === 'ride_cancel') setRideCancellations(value);
    if (key === 'pay_update') setPaymentUpdates(value);
    if (key === 'system_announcment') setSystemAnnouncements(value);

    // trigger API call with full payload (PATCH)
    triggerMutation({
      endPoint: '/driver/my-notify-permissions', // adjust endpoint if different
      body: buildPayload(key, value),
      method: 'patch', // your hook expects method names like 'post'/'patch'/etc.
    });
  };

  if (notifyLoading || isLoading) return <AppLoader />;
  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Notifications & Alerts" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight,
          },
        ]}
      >
        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
        </View>

        {/* Alert Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Toggles</Text>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>New Ride Requests</Text>
            <Switch
              value={newRideRequests}
              onValueChange={val => handleToggle('new_ride', val)}
              trackColor={{ false: '#E0E0E0', true: COLORS.warning }}
              thumbColor={'#f4f3f4'}
              ios_background_color="#E0E0E0"
              disabled={mutationLoading}
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Ride Cancellations</Text>
            <Switch
              value={rideCancellations}
              onValueChange={val => handleToggle('ride_cancel', val)}
              trackColor={{ false: '#E0E0E0', true: COLORS.warning }}
              thumbColor={'#f4f3f4'}
              ios_background_color="#E0E0E0"
              disabled={mutationLoading}
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Payment Updates</Text>
            <Switch
              value={paymentUpdates}
              onValueChange={val => handleToggle('pay_update', val)}
              trackColor={{ false: '#E0E0E0', true: COLORS.warning }}
              thumbColor={'#f4f3f4'}
              ios_background_color="#E0E0E0"
              disabled={mutationLoading}
            />
          </View>

          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>System Announcements</Text>
            <Switch
              value={systemAnnouncements}
              onValueChange={val => handleToggle('system_announcment', val)}
              trackColor={{ false: '#E0E0E0', true: COLORS.warning }}
              thumbColor={'#f4f3f4'}
              ios_background_color="#E0E0E0"
              disabled={mutationLoading}
            />
          </View>
        </View>

        {/* Alert History */}
        <View style={[styles.section, styles.lastSec]}>
          <Text style={styles.sectionTitle}>Alert History</Text>

          {alertHistory.map(alert => (
            <View key={alert.id} style={styles.alertCard}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: alert.bgColor },
                ]}
              >
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
  lastSec: {
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
