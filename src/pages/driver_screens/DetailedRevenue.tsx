import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import PayoutModal from '../../components/PayoutModal';
import PayoutRequest from '../../components/PayoutRequest';

const DetailedRevenue = ({ navigation , route}) => {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {rideId} = route.params || {};

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ride_view', rideId],
    queryFn: () => fetchData(`/ride/${rideId}`),
    keepPreviousData: true,
    enabled: !!rideId,
  });





  // 🟡 Function to handle Confirm click
  const handleConfirmPayout = (amount) => {
    Alert.alert(amount)// little delay for smooth transition
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Detailed Revenue Breakdown" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earnings Chart Section */}
        <View style={styles.reportsCard}>
          <Text style={styles.reportTitle}>Monthly Net Earnings Trend</Text>
          <View style={styles.reportPlaceholderbox}>
            <Text style={styles.reportPlaceholder}>
              [Placeholder: Chart showing Net Earnings vs. Fare over time]
            </Text>
          </View>
        </View>

        {/* Platform Fee Breakdown */}
        <View style={styles.reportsCard}>
          <Text style={styles.reportTitle}>Platform Fee Breakdown</Text>
          <Text style={styles.reportSubtitle}>
            Total collected in Platform Fees (15%) for the month:
            <Text style={styles.reportprice}> $432.00</Text>
          </Text>

          <View style={styles.PlatformFeebox}>
            <View style={styles.Platformredbox}>
              <Text style={styles.PlatformredboxTitle}>
                Operational Costs (Mock):
              </Text>
              <Text style={styles.PlatformredboxPrice}>-$150.00</Text>
            </View>

            {/* 🟢 Green Box Click to open Modal */}
            <TouchableOpacity
              style={styles.Platformgreenbox}
              onPress={() => setShowPayoutModal(true)}
            >
              <Text style={styles.PlatformgreenboxTitle}>
                Net Profit from Fees:
              </Text>
              <Text style={styles.PlatformgreenboxPrice}>+$282.00</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  reportsCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.10)',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 50,
    marginBottom: 30,
  },

  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  reportPlaceholderbox: {
    padding: 16,
    backgroundColor: '#F4F4F4',
    height: 225,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.10)',
  },
  reportPlaceholder: { fontSize: 14, color: '#000', textAlign: 'center' },
  reportSubtitle: { color: '#111', fontSize: 14, fontWeight: '400' },
  reportprice: { color: '#4CD964', fontSize: 14, fontWeight: '600' },

  PlatformFeebox: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
  },
  Platformredbox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF3A2F',
    backgroundColor: 'rgba(255, 58, 47, 0.10)',
    padding: 16,
  },
  PlatformredboxTitle: { color: '#FF3A2F', fontSize: 14, fontWeight: '400' },
  PlatformredboxPrice: { color: '#FF3A2F', fontSize: 10, fontWeight: '700' },

  Platformgreenbox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4CD964',
    backgroundColor: 'rgba(76, 217, 100, 0.10)',
    padding: 16,
  },
  PlatformgreenboxTitle: { color: '#4CD964', fontSize: 14, fontWeight: '400' },
  PlatformgreenboxPrice: { color: '#4CD964', fontSize: 10, fontWeight: '700' },

  
});

export default DetailedRevenue;
