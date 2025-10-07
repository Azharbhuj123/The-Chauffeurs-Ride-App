// @ts-nocheck

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React, { useRef, useState } from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
import UserHeader from "../../components/Header"
import { CommonActions } from '@react-navigation/native';
export default function Home({navigation}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const loyaltyData = [
    {
      id: '1',
      badge: 'PRESTIGE MEMBER',
      points: '1,500 Points',
      subtext: 'Earn a free upgrade on your next ride!',
      rightText: 'First',
      rightSubtext: 'Value on'
    },
    {
      id: '2',
      badge: 'GOLD MEMBER',
      points: '2,800 Points',
      subtext: 'Get 20% off on your next 3 rides!',
      rightText: 'Premium',
      rightSubtext: 'Rewards'
    },
    {
      id: '3',
      badge: 'PLATINUM MEMBER',
      points: '5,000 Points',
      subtext: 'Unlock exclusive benefits and perks!',
      rightText: 'Elite',
      rightSubtext: 'Status'
    },
  ];

  const quick_Destinations = [
    {
        id:1,
        title:"The Grand Hyatt Hotel",
        subTitle:"East trip: Yesterday | 10.2 mi",
    },
      {
        id:2,
        title:"The Grand Hyatt Hotel",
        subTitle:"East trip: Yesterday | 10.2 mi",
    },
      {
        id:3,
        title:"The Grand Hyatt Hotel",
        subTitle:"East trip: Yesterday | 10.2 mi",
    },
      {
        id:4,
        title:"The Grand Hyatt Hotel",
        subTitle:"East trip: Yesterday | 10.2 mi",
    },
      {
        id:5,
        title:"The Grand Hyatt Hotel",
        subTitle:"East trip: Yesterday | 10.2 mi",
    },
      {
        id:6,
        title:"The Grand Hyatt Hotel",
        subTitle:"East trip: Yesterday | 10.2 mi",
    },
  ]

  const onScroll = (event) => {
    const slideSize = wp('90%');
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  const renderLoyaltyCard = ({ item }) => (
    <View style={styles.loyaltyCard}>
      <View style={styles.loyaltyContent}>
        <Text style={styles.loyaltyBadge}>{item.badge}</Text>
        <Text style={styles.loyaltyPoints}>{item.points}</Text>
        <Text style={styles.loyaltySubtext}>{item.subtext}</Text>
      </View>
       
    </View>
  );
  
 

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
       <UserHeader />

        {/* Yellow CTA Card */}
        <TouchableOpacity style={styles.ctaCard}>
          <View>
            <Text style={styles.ctaTitle}>Book a Chauffeur</Text>
            <Text style={styles.ctaSubtitle}>Instant or Scheduled Luxury</Text>
          </View>
          <Icon name="chevron-forward" size={wp('8%')} color="#000" />
        </TouchableOpacity>

        {/* Current Ride Status */}
        <View style={styles.rideStatusCard}>
          <Text style={styles.sectionTitle}>Current Ride Status</Text>
          <View style={styles.statusRow}>
            <Icon name="time-outline" size={wp('5%')} color="#666" />
            <Text style={styles.statusText}>No active trip currently booked</Text>
          </View>
        </View>

        {/* Loyalty & Offers - Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loyalty & Offers</Text>
          <FlatList
            ref={flatListRef}
            data={loyaltyData}
            renderItem={renderLoyaltyCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={wp('90%')}
            decelerationRate="fast"
            contentContainerStyle={styles.sliderContainer}
          />
           
        </View>

        {/* Quick Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Destinations</Text>
          {Array.isArray(quick_Destinations) && quick_Destinations?.map((des)=>(

          <TouchableOpacity key={des?.id} style={styles.destinationCard}>
            <View>
              <Text style={styles.destinationTitle}>{des?.title}</Text>
              <Text style={styles.destinationSubtitle}>{des?.subTitle}</Text>
            </View>
            {/* <Icon name="chevron-forward" size={wp('5%')} color="#666" /> */}
            <Text style={{fontSize:14,color:"#FFD700"}}>Book Again</Text>
            </TouchableOpacity>
          ))}

           
        </View>
     
        {/* Bottom spacing to prevent content hiding behind tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },
  
  ctaCard: {
    backgroundColor: '#FFD700',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  ctaTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  ctaSubtitle: {
    fontSize: wp('3.5%'),
    color: '#000',
  },
  rideStatusCard: {
    backgroundColor: '#fff',
    boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',

    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1.5%'),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: wp('2%'),
  },
  section: {
    marginTop: hp('0.7%'),
    marginBottom: hp('2%'),
  },
  sliderContainer: {
    paddingRight: wp('5%'),
  },
  loyaltyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('85%'),
    marginRight: wp('3%'),
  },
  loyaltyContent: {
    flex: 1,
  },
  loyaltyBadge: {
    fontSize: wp('2.8%'),
    color: '#FFD700',
    marginBottom: hp('1%'),
    fontWeight: '600',
  },
  loyaltyPoints: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp('0.5%'),
  },
  loyaltySubtext: {
    fontSize: wp('3%'),
    color: '#999',
  },
  loyaltyRight: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    alignItems: 'center',
  },
  loyaltyRightText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#000',
  },
  loyaltyRightSubtext: {
    fontSize: wp('2.5%'),
    color: '#666',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1.5%'),
  },
  paginationDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: '#ccc',
    marginHorizontal: wp('1%'),
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
    width: wp('6%'),
  },
  destinationCard: {
    backgroundColor: '#fff',
    boxShadow: '0 0 50px 0 rgba(0, 0, 0, 0.08)',

    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  destinationSubtitle: {
    fontSize: wp('3%'),
    color: '#666',
  },
  bottomSpacer: {
    height: hp('12%'),
  },
});