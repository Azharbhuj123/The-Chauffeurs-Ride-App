//@ts-nocheck
import React, { useState, useRef } from 'react';
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

const rewards = [
  { id: '1', title: 'Free Ride Voucher', cost: '1,000 Points', type: 'redeem' },
  {
    id: '2',
    title: 'Upgrade Vehicle Class',
    cost: '500 Points',
    type: 'redeem',
  },
  {
    id: '3',
    title: 'Exclusive: Book Selected Driver',
    cost: 'Gold Tier Benefit',
    type: 'unlocked',
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
  const tabBarHeight = useTabBarHeightHelper();

  // --- Carousel Logic ---
  const tierCardWidth = wp('45%'); // Card width
  const tierCardMargin = wp('4%'); // Margin between cards
  const snapInterval = tierCardWidth + tierCardMargin;

  const renderTierCard = ({ item }) => (
    <View style={[styles.tierCard, item.isUnlocked && styles.unlockedTierCard]}>
      <Ionicons
        name={item.icon}
        size={wp(8)}
        color={item.isUnlocked ? '#FDD835' : '#ccc'}
      />
      <Text style={styles.tierName}>{item.name}</Text>
      <Text style={styles.tierPoints}>{item.points}</Text>
      <Text style={styles.tierPerks}>{item.perks}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Loyalty & Rewards" />

      <ScrollView contentContainerStyle={[{ paddingBottom: tabBarHeight }]}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Current Balance</Text>
          <Text style={styles.balancePoints}>1,200 Points</Text>
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
          {rewards.map(item => (
            <View key={item.id} style={styles.listItem}>
              <View>
                <Text style={styles.listItemTitle}>{item.title}</Text>
                <Text style={styles.listItemSubtitle}>{item.cost}</Text>
              </View>
              {item.type === 'redeem' ? (
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => setModalVisible(true)}
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
        <Text style={styles.sectionTitle}>Points Activity</Text>
        <View style={styles.listContainer2}>
          {activities.map(item => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.listItemTitle}>{item.title}</Text>
              <Text
                style={[
                  styles.activityPoints,
                  item.points > 0
                    ? styles.pointsPositive
                    : styles.pointsNegative,
                ]}
              >
                {item.points > 0 ? '+' : ''}
                {item.points.toLocaleString()} pts
              </Text>
            </View>
          ))}
        </View>
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
            <Text style={styles.modalItem}>Free Ride Voucher</Text>

            <View style={styles.modalPointsBox}>
              <Text style={styles.modalPointsLabel}>Cost in Points:</Text>
              <Text style={styles.modalPointsValue}>1,000 Points</Text>
            </View>
            <Text style={styles.modalWarning}>
              This action cannot be undone
            </Text>

            <View style={styles.btnContainer}>
              <Button
                title="Confirm Redemption"
                onPress={() => setModalVisible(false)}
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
    fontFamily:'Poppins'

  },

  // Balance Card
  balanceCard: {
    backgroundColor: '#FDD835',
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
  unlockedTierCard: { borderColor: '#FDD835' },
  tierName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginTop: hp('1%'),
    fontFamily:'Poppins'
  },
  tierPoints: {
    fontSize: wp('3.2%'),
    color: '#888',
    marginVertical: hp('0.5%'),
    fontFamily:'Poppins'

  },
  tierPerks: {
    fontSize: wp('3.2%'),
    color: '#555',
    textAlign: 'center',
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: '#999',
    fontFamily:'Poppins'

  },

  // Lists (Redeem & Activity)
  listContainer: { marginHorizontal: wp('5%'), overflow: 'hidden' },
  listContainer2: {
    marginHorizontal: wp('5%'),
    overflow: 'hidden',
    marginBottom: hp(10),
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
  listItemTitle: { fontSize: wp('3.75%'), color: '#000', fontWeight: '500',
    fontFamily:'Poppins'


   },
  listItemSubtitle: {
    fontSize: wp('3.5%'),
    color: '#888',
    marginTop: hp('0.3%'),
    color: '#FDD835',
    fontFamily:'Poppins'

  },
  redeemButton: {
    backgroundColor: '#FDD835',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 20,
  },
  redeemButtonText: { color: '#000', fontWeight: '600', fontSize: wp('3%') ,
    fontFamily:'Poppins'

  },
  unlockedButton: { backgroundColor: '#e0e0e0',
    fontFamily:'Poppins'

   },
  unlockedButtonText: { color: '#888',
    fontFamily:'Poppins'

   },
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
  modalPointsLabel: { fontSize: wp('3.5%'), color: '#666' ,
    fontFamily: 'SF Pro',
  },
  modalPointsValue: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hp('0.5%'),
    fontFamily: 'SF Pro',
  },
  modalWarning: { fontSize: wp('3.5%'), color: 'red', marginBottom: hp('2%'),
    fontFamily: 'SF Pro',
   },
  btnContainer: {
    paddingHorizontal: wp(5),
    width: '115%',
  },
});
