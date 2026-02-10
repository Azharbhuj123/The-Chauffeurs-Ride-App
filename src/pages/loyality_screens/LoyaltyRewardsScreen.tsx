//@ts-nocheck
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useFocusEffect } from '@react-navigation/native';
import AppLoader from '../../components/AppLoader';
import { showToast } from '../../utils/toastHelper';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { COLORS } from '../../utils/Enums';

const { width } = Dimensions.get('window');

// Mock Data
const tiers = [
  {
    id: '1',
    name: 'Gold Chauffeur',
    points: '1000 - 4999 pts',
    perks: 'Free Upgrades & Priority Booking',
    icon: 'trophy',
    isUnlocked: true,
  },
  {
    id: '2',
    name: 'Elite Voyager',
    points: '5000+ pts',
    perks: 'Book by Name & Concierge Service',
    icon: 'diamond',
    isUnlocked: false,
  },
  {
    id: '3',
    name: 'Silver Rider',
    points: '100 - 999 pts',
    perks: '10% Discount on Select Rides',
    icon: 'shield-checkmark',
    isUnlocked: false,
  },
];

const activities = [
  { id: '1', title: 'Redeemed Free Ride Voucher', points: -1000 },
  { id: '2', title: 'Referral Bonus', points: 500 },
  { id: '3', title: 'Points earned: Ride with John', points: 200 },
  { id: '4', title: 'Points earned: Ride with John', points: 200 },
  { id: '5', title: 'Points earned: Ride with John', points: 200 },
  { id: '6', title: 'Points earned: Ride with John', points: 200 },
];

export const LoyaltyRewardsScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPoints, setCurrentPoints] = useState({});
  const tabBarHeight = useTabBarHeightHelper();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-wallet'],
    queryFn: () => fetchData('/user/user-wallet'),
    keepPreviousData: true,
  });

  const wallet_data = data?.wallet;
  const wallet_data_balance = data?.wallet?.balance;
  const transactions = wallet_data?.transactions;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  // --- Carousel Logic ---
  const tierCardWidth = wp('45%'); // Card width
  const tierCardMargin = wp('4%'); // Margin between cards
  const snapInterval = tierCardWidth + tierCardMargin;

  const rewards = [
    {
      id: '1',
      title: 'Free Ride Voucher',
      cost: '1000 Points',
      type: wallet_data_balance >= 1000 ? 'redeem' : 'unlocked',
      voucher_type: 'free_ride',
    },
    {
      id: '2',
      title: 'Upgrade Vehicle Class',
      cost: '500 Points',
      type: wallet_data_balance >= 500 ? 'redeem' : 'unlocked',
      voucher_type: 'upgrade_vehicle',
    },
    {
      id: '3',
      title: 'Exclusive: Book Selected Driver',
      cost: '5000 Points',
      type: wallet_data_balance >= 5000 ? 'redeem' : 'unlocked',
      voucher_type: 'book_driver',
    },
  ];

  const renderTierCard = ({ item }) => (
    <View style={[styles.tierCard, item.isUnlocked && styles.unlockedTierCard]}>
      <Ionicons
        name={item.icon}
        size={wp(8)}
        color={item.isUnlocked ? COLORS.warning : '#ccc'}
      />
      <Text style={styles.tierName}>{item.name}</Text>
      <Text style={styles.tierPoints}>{item.points}</Text>
      <Text style={styles.tierPerks}>{item.perks}</Text>
    </View>
  );

  const handleViewReward = item => {
    if (item.type === 'redeem') {
      setModalVisible(true);
      setCurrentPoints({
        cost: parseInt(item?.cost),
        title: item?.title,
        type: item?.voucher_type,
      });
    }
  };

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        setModalVisible(false);

        showToast({
          type: 'success',
          title: 'Redem Success',
          message: data?.message || 'Successfully Redeemed!',
        });
        refetch();
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Redem Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleSubmit = () => {
    const data_obj = {
      points: currentPoints?.cost,
      type: currentPoints?.type,
      title: currentPoints?.title,
    };
    triggerMutation({
      endPoint: '/voucher/',
      body: data_obj,
      method: 'post',
    });
  };

  if (isLoading) return <AppLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader
        title="Loyalty & Rewards"
        navigation={navigation}
        any_navigation={true}
        navigate_to="Home"
      />

      <ScrollView
        contentContainerStyle={[{ paddingBottom: tabBarHeight + 35 }]}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Current Balance</Text>

          <Text style={styles.balancePoints}>
            {wallet_data_balance > 10000 ? '10000+' : wallet_data_balance}{' '}
            Points
          </Text>
          <Text style={styles.balanceSub}>
            Use your points for free rides & premium features.
          </Text>
        </View>

        {/* Chauffeur Tiers */}
        <Text style={styles.sectionTitle}>Chauffeur Tiers</Text>
        <FlatList
          horizontal
          data={tiers}
          renderItem={renderTierCard}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp('5%') }}
          snapToInterval={snapInterval}
          decelerationRate="fast"
        />

        {/* Redeem Rewards */}
        <Text style={styles.sectionTitle}>Redeem Rewards</Text>
        <View style={styles.listContainer}>
          {rewards.map((item,index) => (
            <View key={index} style={styles.listItem}>
              <View>
                <Text style={styles.listItemTitle}>{item.title}</Text>
                <Text style={styles.listItemSubtitle}>{item.cost}</Text>
              </View>
              {item.type === 'redeem' ? (
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => handleViewReward(item)}
                >
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.redeemButton, styles.unlockedButton]}>
                  <Text
                    style={[styles.redeemButtonText, styles.unlockedButtonText]}
                  >
                    Unlocked
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Points Activity */}
        {transactions?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Points Activity</Text>
            <View style={styles.listContainer2}>
              {transactions?.map((item , index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>
                    {item.description?.length > 28
                      ? item.description.slice(0, 28) + '...'
                      : item.description}
                  </Text>
                  <Text
                    style={[
                      styles.activityPoints,
                      item.amount > 0
                        ? styles.pointsPositive
                        : styles.pointsNegative,
                    ]}
                  >
                    {item.amount > 0 ? '+' : ''}
                    {item.amount.toLocaleString()} pts
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Redemption Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={wp(6)} color="#888" />
            </TouchableOpacity>
            <Ionicons
              name="star"
              size={wp(10)}
              color="#FDD835"
              style={{ marginBottom: hp('1%') }}
            />
            <Text style={styles.modalTitle}>Confirm Redemption</Text>
            <Text style={styles.modalSub}>You are about to redeem:</Text>
            <Text style={styles.modalItem}>{currentPoints?.title}</Text>

            <View style={styles.modalPointsBox}>
              <Text style={styles.modalPointsLabel}>Cost in Points:</Text>
              <Text style={styles.modalPointsValue}>
                {currentPoints?.cost} Points
              </Text>
            </View>
            <Text style={styles.modalWarning}>
              This action cannot be undone
            </Text>

            <View style={styles.btnContainer}>
              <Button
                isLoading={loading}
                title="Confirm Redemption"
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { paddingVertical: hp('2%'), alignItems: 'center' },
  headerTitle: { fontSize: wp('5%'), fontWeight: '600', color: '#000' },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    marginHorizontal: wp('5%'),
    marginTop: hp('3%'),
    marginBottom: hp('1.5%'),
    fontFamily: 'Poppins-Regular',
  },

  // Balance Card
  balanceCard: {
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    padding: wp('5%'),
    marginHorizontal: wp('5%'),
    alignItems: 'center',
    marginTop: hp(3),
    borderWidth: 1,
    borderColor: '1px solid rgba(17, 17, 17, 0.10)',
  },
  balanceLabel: { fontSize: wp('3.8%'), color: '#333' },
  balancePoints: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#000',
    marginVertical: hp('0.5%'),
    marginTop: hp(1),
  },
  balanceSub: { fontSize: wp('3%'), color: '#333', marginTop: hp(1) },

  // Tiers Carousel
  tierCard: {
    width: wp('45%'),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginRight: wp('4%'),
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  unlockedTierCard: { borderColor: COLORS.warning },
  tierName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginTop: hp('1%'),
    fontFamily: 'Poppins-Regular',
  },
  tierPoints: {
    fontSize: wp('3.2%'),
    color: '#888',
    marginVertical: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  tierPerks: {
    fontSize: wp('3.2%'),
    color: '#555',
    textAlign: 'center',
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: '#999',
    fontFamily: 'Poppins-Regular',
  },

  // Lists (Redeem & Activity)
  listContainer: { marginHorizontal: wp('5%'), overflow: 'hidden' },
  listContainer2: {
    marginHorizontal: wp('5%'),
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '1px solid rgba(17, 17, 17, 0.10)',
  },
  listItemTitle: {
    fontSize: wp('3.75%'),
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  listItemSubtitle: {
    fontSize: wp('3.5%'),
    color: '#888',
    marginTop: hp('0.3%'),
    color: COLORS.warning,
    fontFamily: 'Poppins-Regular',
  },
  redeemButton: {
    backgroundColor: COLORS.warning,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 20,
  },
  redeemButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: wp('3%'),
    fontFamily: 'Poppins-Regular',
  },
  unlockedButton: { backgroundColor: '#e0e0e0', fontFamily: 'Poppins-Regular' },
  unlockedButtonText: { color: '#888', fontFamily: 'Poppins-Regular' },
  activityPoints: { fontSize: wp('4%'), fontWeight: '600' },
  pointsPositive: { color: 'green' },
  pointsNegative: { color: 'red' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp('85%'),
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: wp('6%'),
    alignItems: 'center',
  },
  closeButton: { position: 'absolute', top: wp('3%'), right: wp('3%') },
  modalTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hp('2%'),
  },
  modalSub: { fontSize: wp('3%'), color: '#666', marginTop: hp('1.75%') },
  modalItem: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#000',
    marginVertical: hp('0.5%'),
    marginTop: hp('1.75%'),
    fontFamily: 'SF Pro',
  },
  modalPointsBox: {
    width: '100%',
    backgroundColor: '#FFFBEA',
    borderColor: '#FFDDA9',
    borderWidth: 1,
    borderRadius: 12,
    padding: wp('3%'),
    marginVertical: hp('2%'),
    alignItems: 'center',
    fontFamily: 'SF Pro',
  },
  modalPointsLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontFamily: 'SF Pro',
  },
  modalPointsValue: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hp('0.5%'),
    fontFamily: 'SF Pro',
  },
  modalWarning: {
    fontSize: wp('3.5%'),
    color: 'red',
    marginBottom: hp('2%'),
    fontFamily: 'SF Pro',
  },
  btnContainer: {
    paddingHorizontal: wp(5),
    width: '115%',
  },
});
