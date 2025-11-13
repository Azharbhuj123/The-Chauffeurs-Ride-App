// @ts-nocheck

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
   FlatList,
  RefreshControl,
  ActivityIndicator
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
import { useInfiniteQuery } from '@tanstack/react-query';
import AppLoader from '../../components/AppLoader';

 

const RatingsReviewsScreen = ({ navigation }) => {
  const [active, setActive] = useState(1);
  const tabBarHeight = useTabBarHeightHelper();

  // === React Query v5: object form ===
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['driver-review'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchData(`/review/reviews?page=${pageParam}`);
      return res;
    },
    getNextPageParam: lastPage => {
      if (!lastPage) return undefined;
      return lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined;
    },
    keepPreviousData: true,
  });

  // combine pages into a single array of reviews
  const reviews = data?.pages?.flatMap(p => p.data) ?? [];

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

  const active_img = order => {
    const rateImage =
      active === order
        ? require('../../assets/images/rate-outline.png')
        : require('../../assets/images/rate.png');

    return rateImage;
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderItem = ({ item: review }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ReviewList', { review })}
        key={review._id}
        style={styles.reviewCard}
      >
        <View style={styles.reviewContent}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{review?.user?.name ?? '—'}</Text>
          </View>

          <View style={styles.starsContainer}>{renderStars(review.rating)}</View>

          <Text style={styles.reviewComment}>
            {review.comment ? review.comment.slice(0, 50) + '...' : 'No comment'}
          </Text>
          <Text style={styles.reviewDate}>
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const ListFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 12 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const EmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ color: '#6B7280' }}>No reviews found.</Text>
      </View>
    );
  };

  if(isLoading) return <AppLoader />
  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Operations Overview" navigation={navigation} />

      <Text style={styles.title}>Ratings & Reviews</Text>

      <View style={styles.statsGrid}>
        <TouchableOpacity
          onPress={() => setActive(1)}
          style={[styles.statCard, active === 1 ? styles.activeCard : null]}
        >
          <Image style={styles.rateImg} source={active_img(1)} />
          <Text style={styles.statTopText}>Average Rating</Text>
          <Text style={styles.statMainText}>
            {Number(data?.pages?.[0]?.averageRating ?? data?.averageRating ?? 0).toFixed(2)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActive(2)}
          style={[styles.statCard, active === 2 ? styles.activeCard : null]}
        >
          <Image style={styles.rateImg} source={active_img(2)} />
          <Text style={styles.statTopText}>Total Reviews</Text>
          <Text style={styles.statMainText}>
            {Number(data?.pages?.[0]?.totalRatings ?? data?.totalRatings ?? reviews.length)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActive(3)}
          style={[styles.statCard, active === 3 ? styles.activeCard : null]}
        >
          <Image style={styles.rateImg} source={active_img(3)} />
          <Text style={styles.statTopText}>Review Trend</Text>
          <Text style={styles.statMainText}>
            {data?.pages?.[0]?.ratingTrend ?? data?.ratingTrend ?? 0} in 30
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={item => item._id ?? item.id?.toString() ?? Math.random().toString()}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + (Platform.OS === 'ios' ? 55 : 20),
          paddingHorizontal: 0,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={<EmptyComponent />}
        onEndReachedThreshold={0.6}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      
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
