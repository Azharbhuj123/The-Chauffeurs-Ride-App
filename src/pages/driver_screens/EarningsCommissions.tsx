import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';

const EarningsCommissions = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Ride Revenue');
  const tabBarHeight = useTabBarHeightHelper();

  // === Tab Data ===
  const rideRevenueClients = [
    {
      id: 1,
      name: 'Client: John Doe',
      date: 'Ride Date: Oct 6, 2025',
      fare: 'Fare: $120.00',
      platform: 'Platform Fee: 15%',
      amount: '$102.00 NET',
    },
    {
      id: 2,
      name: 'Client: Sarah C.',
      date: 'Ride Date: Oct 6, 2025',
      fare: 'Fare: $65.00',
      platform: 'Platform Fee: 15%',
      amount: '$55.25 NET',
    },
    {
      id: 3,
      name: 'Client: Sarah C.',
      date: 'Ride Date: Oct 6, 2025',
      fare: 'Fare: $65.00',
      platform: 'Platform Fee: 15%',
      amount: '$55.25 NET',
    },
  ];

  const referralClients = [
    {
      id: 1,
      name: 'Global Wheels Ltd.',
      city: 'Canada',
      amount: '+$45.00',
    },
    {
      id: 1,
      name: 'City Drive EU',
      city: 'Germany',
      amount: '+$40.00',
    },
  ];

  const dispatchClients = [
    {
      id: 1,
      name: 'Ride to London',
      date: 'Partner: EliteCars',
      fare: 'Ride Value: $300.00',
      platform: 'Your Commission: $45.00',
    },
    {
      id: 2,
      name: 'Ride to Paris',
      date: 'Partner: Rouge Fleet',
      fare: 'Ride Value: $200.00',
      platform: 'Your Commission: $30.00',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Earnings & Commissions" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: tabBarHeight - 50 }]}
      
      >
        {/* Header Section */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.totalBalanceLabel}>Total Balance</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Monthly ▼</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.totalBalance}>$2,480.00</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.TotalBalanceiconbox}>
                <Image
                  source={require('../../assets/images/TotalRides.png')}
                  style={styles.Balanceicon}
                />
                <Text style={styles.statTitle}>Total Rides</Text>
              </View>
              <Text style={styles.statValue}>64 rides</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.TotalBalanceiconbox}>
                <Image
                  source={require('../../assets/images/doller.png')}
                  style={styles.Balanceicon}
                />
                <Text style={styles.statTitle}>Pending Payout</Text>
              </View>
              <Text style={styles.statValue}>$320.00</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.TotalBalanceiconbox}>
                <Image
                  source={require('../../assets/images/Avg.png')}
                  style={styles.Balanceicon}
                />
                <Text style={styles.statTitle}>Avg. per Ride</Text>
              </View>
              <Text style={styles.statValue}>$38.75</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['Ride Revenue', 'Referral (1%)', 'Dispatch (15%)'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab,
                { flex: 1 },
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RIDE REVENUE CARD */}
        {selectedTab === 'Ride Revenue' && (
          <View style={styles.cardsContainer}>
            {rideRevenueClients.map((client,ind) => (
              <View key={ind} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientAmount}>{client.amount}</Text>
                </View>
                <Text style={styles.clientDetail}>{client.date}</Text>
                <Text style={styles.clientDetail}>{client.fare}</Text>
                <Text style={styles.clientDetail}>{client.platform}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.viewReportButton}>
              <Text style={styles.viewReportText}>View Ride Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* REFERRAL CARD */}
        {selectedTab === 'Referral (1%)' && (
          <View style={styles.cardsContainer}>
            <View style={styles.Globalreferrals}>
              <Text style={styles.Globalreferralstext}>
                {' '}
                You earned<Text style={styles.clientAmount}>$85.00</Text>this
                month from global referrals (1%).
              </Text>
            </View>
            <Text style={styles.sectionTitle}>
              Recent Referrals (1% Commission)
            </Text>
            {referralClients.map((client,ind) => (
              <View key={ind} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientAmount}>{client.amount}</Text>
                </View>
                <Text style={styles.clientDetail}>{client.city}</Text>
              </View>
            ))}
          </View>
        )}

        {/* DISPATCH CARD */}
        {selectedTab === 'Dispatch (15%)' && (
          <View style={styles.cardsContainer}>
            <Text style={styles.sectionTitle}>
              Dispatches to Partners (15% Commission)
            </Text>
            {dispatchClients.map((client,ind)  => (
              <View key={ind} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <Text style={styles.clientName}>{client.name}</Text>
                </View>
                <Text style={styles.clientDetail}>{client.date}</Text>
                <Text style={styles.clientDetail}>{client.fare}</Text>
                <Text style={styles.clientDetailred}>{client.platform}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reports Section */}
        <View style={styles.reportsCard}>
          <Text style={styles.reportTitle}>Reports & Payout</Text>
          <Text style={styles.reportSubtitle}>Earnings Trend (Monthly)</Text>

          <View style={styles.reportPlaceholderbox}>
            <Text style={styles.reportPlaceholder}>
              [Mock Earnings Trend Graph Placeholder]
            </Text>
          </View>
          <Button  title='Request Payout'  onPress={() => navigation.navigate('DetailedRevenue')}/> 
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#F9FAFB' },

headerCard: {
  backgroundColor: '#fff',
  margin: 16,
  padding: 20,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
},
headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
totalBalanceLabel: { fontSize: 14, color: '#000', fontWeight: '600' },
dropdown: {
  backgroundColor: '#FFF',
  borderRadius: 50,
  borderWidth: 1,
  borderColor: '#DFDFDF',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 2 },
  elevation: 5,
  paddingHorizontal: 14,
  paddingVertical: 6,
},
dropdownText: { fontSize: 12, color: '#444' },
totalBalance: {
  fontWeight: '600',
  fontSize: 26,
  color: '#4CD964',
  marginTop: 4,
  marginBottom: 16,
},

statsContainer: { gap: 14 },
statItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 14,
  backgroundColor: '#F4F4F4',
  padding: 16,
},
statTitle: { fontSize: 14, color: '#000' },
statValue: { fontSize: 12, color: '#000' },

tabsContainer: {
  flexDirection: 'row',
  backgroundColor: '#F1F1F1',
  marginHorizontal: 16,
  padding: 6,
  borderRadius: 25,
  marginVertical: 20,
},
tab: { paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
activeTab: { backgroundColor: '#FFD600' },
tabText: { fontSize: 13, color: '#777' },
activeTabText: { color: '#000', fontWeight: '700' },

cardsContainer: {
  marginHorizontal: 16,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: 'rgba(17,17,17,0.10)',
  backgroundColor: '#FFF',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.08,
  shadowRadius: 50,
  padding: 20,
  marginBottom: 20,
},
sectionTitle: {
  fontSize: 14,
  fontWeight: '400',
  color: '#000',
  marginBottom: 10,
},
clientCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: 'rgba(17,17,17,0.10)',
  shadowRadius: 4,
  elevation: 2,
},
clientHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 6,
},
clientName: { fontSize: 15, fontWeight: '600', color: '#000' },
clientAmount: { fontSize: 14, fontWeight: '700', color: '#38A169' },
clientDetail: { fontSize: 12.5, color: '#666', marginBottom: 2 },
clientDetailred: {
  fontSize: 12.5,
  color: '#ff0000ff',
  marginBottom: 2,
  fontWeight: '600',
},
viewReportButton: {
  backgroundColor: '#FFF',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#FFD600',
  paddingVertical: 12,
  alignItems: 'center',
  marginTop: 10,
  elevation: 2,
},
viewReportText: { color: '#000', fontSize: 14, fontWeight: '400' },

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
  marginBottom: 100,
},
reportTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: '#000',
  marginBottom: 4,
},
reportSubtitle: { fontSize: 13, color: '#666', marginBottom: 10 },
reportPlaceholderbox: {
  padding: 16,
  backgroundColor: '#F4F4F4',
  height: 110,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 14,
},
reportPlaceholder: { fontSize: 14, color: '#000' },
payoutButton: {
  backgroundColor: '#FFD600',
  borderRadius: 30,
  paddingVertical: 15,
  alignItems: 'center',
  elevation: 3,
},
payoutButtonText: { fontSize: 14, color: '#000', fontWeight: '400' },

TotalBalanceiconbox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
Balanceicon: { width: 10, height: 10, resizeMode: 'contain' },

Globalreferrals: {
  padding: 16,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#FEC400',
  backgroundColor: 'rgba(248, 216, 51, 0.10)',
  marginBottom: 15,
},
Globalreferralstext: {
  fontSize: 14,
  color: '#666',
  fontWeight: '400',
},
});

export default EarningsCommissions;
