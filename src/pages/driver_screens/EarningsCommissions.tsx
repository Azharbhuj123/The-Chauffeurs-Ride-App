// @ts-nocheck

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import AppLoader from '../../components/AppLoader';
import CustomDropdown from '../../components/CustomDropdown';
import { category_class, monthly_filter } from '../../utils/Enums';
import { useFocusEffect } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import SkeletonBox from '../../utils/SkeletonBox';
import { formatReadableDate, formatSmartDate } from '../../utils/DateFormats';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PayoutRequest from '../../components/PayoutRequest';
import PayoutModal from '../../components/PayoutModal';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

const { width, height } = Dimensions.get('window');

const tabs = [
  {
    label: 'Ride Revenue',
    value: 'ride',
  },
  // {
  //   label: 'Referral (1%)',
  //   value: 'referral',
  // },
  // {
  //   label: 'Dispatch (15%)',
  //   value: 'dispatch',
  // },
];

const EarningsCommissions = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [filter, setFilter] = useState('');
  const [limit, setLimit] = useState(10);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [payout_amount, setpayout_amount] = useState(0);
  const tabBarHeight = useTabBarHeightHelper();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['driver-earning', filter],
    queryFn: () => fetchData(`/driver/driver-earnings?filter=${filter}`),
    keepPreviousData: true,
  });

  const {
    data: rideData,
    isLoading: rideDataLoading,
    refetch: rideDataRefetch,
  } = useQuery({
    queryKey: ['ride-revenue', selectedTab.value, limit],
    queryFn: () =>
      fetchData(
        `/driver/ride-revenue?page=1&limit=${limit}&what_to_show=${selectedTab.value}`,
      ),
    keepPreviousData: true,
  });

  const ride_data = rideData?.data?.data;

  const driver_state = data?.stats;

  const currentLimit = rideData?.data?.length || 0;
  const totalItems = rideData?.totalItems || 0;

  const handleLoadMore = () => {
    // 👇 limit badhao jab tak total items ke barabar na ho
    if (currentLimit < totalItems) {
      setLimit(prev => prev + 10); // each click increases limit by 10
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

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

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        setpayout_amount(data?.data?.amount);
        setShowPayoutModal(false);
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 300); // little delay for smooth transition
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Payout Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleConfirmPayout = amount => {
    const data_obj = {
      amount,
    };

    triggerMutation({
      endPoint: '/payout/',
      body: data_obj,
      method: 'post',
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Earnings & Commissions" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: tabBarHeight + 20 }]}
      >
        {/* Header Section */}
        {isLoading ? (
          <SkeletonBox height={350} />
        ) : (
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.totalBalanceLabel}>Total Balance</Text>
                <Text style={styles.totalBalance}>
                  ${Number(driver_state?.total_balance)?.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity style={styles.dropdown}>
                <CustomDropdown
                  data={monthly_filter}
                  placeholder={'Filter'}
                  onChange={item => setFilter(item?.value)}
                />
                {/* <Text style={styles.dropdownText}>Monthly ▼</Text> */}
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.TotalBalanceiconbox}>
                  <Image
                    source={require('../../assets/images/TotalRides.png')}
                    style={styles.Balanceicon}
                  />
                  <Text style={styles.statTitle}>Total Rides</Text>
                </View>
                <Text style={styles.statValue}>
                  {Number(driver_state?.total_completed_rides)} rides
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.TotalBalanceiconbox}>
                  <Image
                    source={require('../../assets/images/doller.png')}
                    style={styles.Balanceicon}
                  />
                  <Text style={styles.statTitle}>Pending Dues To Pay</Text>
                </View>
                <Text style={styles.statValue}>
                  ${Number(driver_state?.total_pending_dues)?.toFixed(2)}
                </Text>
              </View>

              {/* <View style={styles.statItem}>
                <View style={styles.TotalBalanceiconbox}>
                  <Image
                    source={require('../../assets/images/doller.png')}
                    style={styles.Balanceicon}
                  />
                  <Text style={styles.statTitle}>Pending Payout</Text>
                </View>
                <Text style={styles.statValue}>
                  ${Number(driver_state?.total_pending_payout)?.toFixed(2)}
                </Text>
              </View> */}

              <View style={styles.statItem}>
                <View style={styles.TotalBalanceiconbox}>
                  <Image
                    source={require('../../assets/images/Avg.png')}
                    style={styles.Balanceicon}
                  />
                  <Text style={styles.statTitle}>Avg. per Ride</Text>
                </View>
                <Text style={styles.statValue}>
                  ${Number(driver_state?.avg_per_ride)?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs?.map(tab => (
            <TouchableOpacity
              key={tab?.value}
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
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTab.label === 'Ride Revenue' &&
          (rideDataLoading ? (
            <SkeletonBox height={350} />
          ) : (
            <View style={styles.cardsContainer}>
              {ride_data?.length === 0 ? (
                <View
                  style={{
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center',
                    marginTop: 15,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      { fontStyle: 'italic', color: '#999' },
                    ]}
                  >
                    You have not made any rides yet
                  </Text>
                </View>
              ) : (
                <View>
                  {ride_data?.map((client, ind) => (
                    <View key={ind} style={styles.clientCard}>
                      <View style={styles.clientHeader}>
                        <Text style={styles.clientName}>
                          Client: {client?.user?.name}
                        </Text>
                        <Text style={styles.clientAmount}>
                          ${client?.payment_breakdown?.driver_earning}
                        </Text>
                      </View>
                      <Text style={styles.clientDetail}>
                        Ride Date:{' '}
                        {formatReadableDate(client?.ride_complete_at)}
                      </Text>
                      <Text style={styles.clientDetail}>
                        Fare: ${client?.payment_breakdown?.total_fare}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'flex-end',
                        }}
                      >
                        <Text style={styles.clientDetail}>
                          Platform Fee: $
                          {client?.payment_breakdown?.platform_fee}
                        </Text>
                        {/* Uncomment when navigation is ready */}
                        {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('DetailedRevenue', { rideId: client?._id })
                }
              >
                <Icon name="arrow-forward-ios" size={20} color="#999" />
              </TouchableOpacity> */}
                      </View>
                    </View>
                  ))}

                  {currentLimit < totalItems && (
                    <TouchableOpacity
                      onPress={handleLoadMore}
                      style={styles.viewReportButton}
                    >
                      <Text style={styles.viewReportText}>Load More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}

        {/* REFERRAL CARD
        {selectedTab.label === 'Referral (1%)' &&
          (rideDataLoading ? (
            <SkeletonBox height={350} />
          ) : (
            <View style={styles.cardsContainer}>
              {ride_data?.length === 0 ? (
                <View
                  style={{
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center',
                    marginTop: 15,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      { fontStyle: 'italic', color: '#999' },
                    ]}
                  >
                    You have not made any referral rides yet
                  </Text>
                </View>
              ) : (
                <View>
                  <View style={styles.Globalreferrals}>
                    <Text style={styles.Globalreferralstext}>
                      You earned{' '}
                      <Text style={styles.clientAmount}>
                        ${' '}
                        {Number(
                          ride_data?.referralStats?.totalReferralEarning,
                        )?.toFixed(2)}
                      </Text>{' '}
                      this month from global referrals (1%).
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Recent Referrals (1% Commission)
                  </Text>

                  {ride_data?.map((client, ind) => (
                    <View key={ind} style={styles.clientCard}>
                      <View style={styles.clientHeader}>
                        <Text style={styles.clientName}>
                          {client?.user?.name}
                        </Text>
                        <Text style={styles.clientAmount}>
                          {client?.payment_breakdown?.referral_fee}
                        </Text>
                      </View>
                      <Text style={styles.clientDetail}>
                        {client?.drop_location?.famous_location || '--'}
                      </Text>
                    </View>
                  ))}
                  {currentLimit < totalItems && (
                    <TouchableOpacity
                      onPress={handleLoadMore}
                      style={styles.viewReportButton}
                    >
                      <Text style={styles.viewReportText}>Load More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}

        DISPATCH CARD
        {selectedTab.label === 'Dispatch (15%)' &&
          (rideDataLoading ? (
            <SkeletonBox height={350} />
          ) : (
            <View style={styles.cardsContainer}>
              {ride_data?.length === 0 ? (
                <View
                  style={{
                    justifyContent: 'center',
                    width: '100%',
                    alignItems: 'center',
                    marginTop: 15,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      { fontStyle: 'italic', color: '#999' },
                    ]}
                  >
                    You have not made any dispatch rides yet
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.sectionTitle}>
                    Dispatches to Partners (15% Commission)
                  </Text>
                  {ride_data?.map((client, ind) => (
                    <View key={ind} style={styles.clientCard}>
                      <View style={styles.clientHeader}>
                        <Text style={styles.clientName}>
                          Ride To {client?.pickup_location?.famous_location}
                        </Text>
                      </View>
                      <Text style={styles.clientDetail}>
                        Partner: {client?.referral_info?.referred_to?.name}
                      </Text>
                      <Text style={styles.clientDetail}>
                        Ride Value: ${client?.payment_breakdown?.total_fare}
                      </Text>
                      <Text style={styles.clientDetailred}>
                        Your Commission: $
                        {client?.payment_breakdown?.dispatch_fee}
                      </Text>
                    </View>
                  ))}
                  {currentLimit < totalItems && (
                    <TouchableOpacity
                      onPress={handleLoadMore}
                      style={styles.viewReportButton}
                    >
                      <Text style={styles.viewReportText}>Load More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))} */}

        {/* Reports Section */}
        {/* <View style={styles.reportsCard}>
          
          <Button
            title="Request Payout"
            onPress={() => setShowPayoutModal(true)}
          />
        </View> */}
        {/* 💲 Confirm Payout Modal */}
        <PayoutRequest
          setShowPayoutModal={setShowPayoutModal}
          showPayoutModal={showPayoutModal}
          handleConfirmPayout={handleConfirmPayout}
          balance={driver_state?.total_balance}
          isLoading={loading}
        />

        {/* ✅ Success Modal */}
        <PayoutModal
          setShowSuccessModal={setShowSuccessModal}
          showSuccessModal={showSuccessModal}
          amount={payout_amount}
        />
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
  totalBalanceLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  dropdown: {
    width: width * 0.3,
  },
  dropdownText: { fontSize: 12, color: '#444' },
  totalBalance: {
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
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
  statTitle: { fontSize: 14, color: '#000', fontFamily: 'Poppins-Regular' },
  statValue: { fontSize: 12, color: '#000', fontFamily: 'Poppins-Regular' },

  tabsContainer: {
    flexDirection: 'row',
    // backgroundColor: '#F1F1F1',
    marginHorizontal: 16,
    padding: 6,
    borderRadius: 25,
    // marginVertical: 20,
  },
  tab: { paddingVertical: 10, borderRadius: 20, fontSize: 20 },
  tabText: { fontSize: 16, color: '#000', fontFamily: 'Poppins-Regular' },
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
  clientName: {
    fontSize: 15,
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  clientAmount: { fontSize: 14, fontWeight: '700', color: '#38A169' },
  clientDetail: { fontSize: 12.5, color: '#666', marginBottom: 2 },
  clientDetailred: {
    fontSize: 12.5,
    color: '#ff0000ff',
    marginBottom: 2,
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
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
    // borderRadius: 15,
    // borderWidth: 1,
    // borderColor: 'rgba(17,17,17,0.10)',
    // backgroundColor: '#FFF',
    // shadowColor: '#000',
    // shadowOpacity: 0.08,
    // shadowRadius: 50,
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
