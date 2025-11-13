// @ts-nocheck

import React from 'react';
import { View, Text, StyleSheet,  Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import AppLoader from '../../components/AppLoader';
const { width, height } = Dimensions.get('window');

 
// Font size responsive function
const fs = size => {
  return Math.round((size * width) / 375); // 375 is iPhone X base width
};

// Star component
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={styles.star}>
        {i <= rating ? '★' : '☆'}
      </Text>,
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

export default function ReviewList({ navigation,route }) {

  const {review} = route.params||{}




    const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-review',review?._id],
    queryFn: () => fetchData(`/review/reviews/${review?._id}`),
    keepPreviousData: true,
  });

  const review_data = data?.review

  console.log(data,'data');
  
  if(isLoading) return <AppLoader/>


  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Back to Review List" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Review from {review_data?.user?.name}.</Text>
          <StarRating rating={review_data?.rating} />
          <Text style={styles.reviewText}>
            {review_data?.comment}
          </Text>
        </View>

        {/* Owner Response Section */}
        {/* <View style={styles.ownerResponseSection}>
          <Text style={styles.ownerResponseTitle}>Owner Response</Text>
          <View style={styles.responseBox}>
            <Text style={styles.repliedLabel}>Replied:</Text>
            <Text style={styles.responseText}>
              Prompt, friendly driver and a very clean car!"
            </Text>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: wp(4.3),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  reviewSection: {
    marginBottom: hp(2.5),
  },
  reviewTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(1),
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
  },
  star: {
    fontSize: fs(18),
    color: '#FFD700',
    marginRight: wp(0.5),
  },
  reviewText: {
    fontSize: fs(14),
    color: '#000',
    lineHeight: fs(20),
  },
  ownerResponseSection: {
    marginTop: hp(1),
  },
  ownerResponseTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(1.5),
  },
  responseBox: {
    backgroundColor: '#E8F8E8',
    borderRadius: wp(3),
    borderWidth: 1.5,
    borderColor: '#A8E6A8',
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(3),
    boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.10)',
  },
  repliedLabel: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: hp(0.8),
  },
  responseText: {
    fontSize: fs(14),
    color: '#4CAF50',
    lineHeight: fs(20),
  },
});
