// @ts-nocheck

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';

const reviews = [
  {
    id: 1,
    name: 'Alice J.',
    status: 'Pending',
    rating: 4,
    comment: 'Prompt, friendly driver and a very clean car!',
    date: '2 days ago',
  },
  {
    id: 2,
    name: 'Bob K.',
    status: 'Replied',
    rating: 4,
    comment: 'Prompt, friendly driver and a very clean car!',
    date: '5 days ago',
  },
  {
    id: 3,
    name: 'Alice J.',
    status: 'Pending',
    rating: 4,
    comment: 'Prompt, friendly driver and a very clean car!',
    date: '1 week ago',
  },
  {
    id: 4,
    name: 'Alice J.',
    status: 'Pending',
    rating: 4,
    comment: 'Prompt, friendly driver and a very clean car!',
    date: '2 weeks ago',
  },
   
];

const RatingsReviewsScreen = ({ navigation }) => {
  const [active, setActive] = useState(1);
  const tabBarHeight = useTabBarHeightHelper();

  const renderStars = rating => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text
          key={i}
          style={[
            styles.star,
            i < rating ? styles.starFilled : styles.starEmpty,
          ]}
        >
          ★
        </Text>,
      );
    }
    return stars;
  };

  const getStatusStyle = status =>
    status === 'Pending' ? styles.statusPending : styles.statusReplied;

  const getStatusTextStyle = status =>
    status === 'Pending' ? styles.statusPendingText : styles.statusRepliedText;

  const active_img = order => {
    const rateImage =
      active === order
        ? require('../../assets/images/rate-outline.png')
        : require('../../assets/images/rate.png');

    return rateImage;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Operations Overview" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + (Platform.OS === 'ios' ? 55 : 20),
        }}
      >
        {/* Header */}
        <Text style={styles.title}>Ratings & Reviews</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            onPress={() => setActive(1)}
            style={[styles.statCard, active === 1 ? styles.activeCard : '']}
          >
            <Image style={styles.rateImg} source={active_img(1)} />
            <Text style={styles.statTopText}>Average Rating</Text>
            <Text style={styles.statMainText}>4.25</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActive(2)}
            style={[styles.statCard, active === 2 ? styles.activeCard : '']}
          >
            <Image style={styles.rateImg} source={active_img(2)} />

            <Text style={styles.statTopText}>Total Reviews</Text>
            <Text style={styles.statMainText}>4</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActive(3)}
            style={[styles.statCard, active === 3 ? styles.activeCard : '']}
          >
            <Image style={styles.rateImg} source={active_img(3)} />

            <Text style={styles.statTopText}>Review Trend</Text>
            <Text style={styles.statMainText}>+0.2 in 30</Text>
          </TouchableOpacity>
        </View>
        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map(review => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ReviewList')}
              key={review.id}
              style={styles.reviewCard}
            >
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <View style={getStatusStyle(review.status)}>
                    <Text style={getStatusTextStyle(review.status)}>
                      {review.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.starsContainer}>
                  {renderStars(review.rating)}
                </View>

                <Text style={styles.reviewComment}>{review.comment}</Text>
                {/* <Text style={styles.reviewDate}>{review.date}</Text> */}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: hp(3),
    marginBottom: 20,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingTop: hp(2),
    paddingBottom: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 4,
  },
  rateImg: {
    objectFit: 'cover',
  },

  activeCard: {
    backgroundColor: '#F8D833',
  },

  statTopText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#5A5A5A',
    marginBottom: 10,
    marginTop: hp(1),
    textAlign: 'center',
  },

  statMainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },

  reviewsList: {
    gap: 12,
  },

  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },

  reviewContent: {
    flex: 1,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 6,
  },

  statusPending: {
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  statusReplied: {
    backgroundColor: '#ECFDF5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  statusPendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  statusRepliedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },

  starsContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  star: {
    fontSize: 16,
    fontWeight: '600',
  },

  starFilled: {
    color: '#FACC15',
  },

  starEmpty: {
    color: '#E5E7EB',
  },

  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },

  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  chevron: {
    fontSize: 26,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});

export default RatingsReviewsScreen;
