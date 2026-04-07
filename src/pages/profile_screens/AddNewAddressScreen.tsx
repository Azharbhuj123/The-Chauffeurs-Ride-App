//@ts-nocheck

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useInfiniteQuery } from '@tanstack/react-query';
import AppLoader from '../../components/AppLoader';
import { COLORS } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';

const { width, height } = Dimensions.get('window');

export const AddNewAddressScreen = ({ navigation }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['user-address'],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await fetchData(`/address?page=${pageParam}`);
        return res;
      },
      getNextPageParam: lastPage => {
        const { currentPage, totalPages } = lastPage;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      keepPreviousData: true,
    });

  const addresses = data?.pages.flatMap(page => page?.data || []) || [];

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
      if (isCloseToBottom && hasNextPage && !isFetchingNextPage)
        fetchNextPage();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const { triggerMutation } = useActionMutation({
    onSuccessCallback: () => {
      queryClient.invalidateQueries(['user-address']);
      showToast({ type: 'success', title: 'Address Deleted', message: '' });
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: errmsg || 'Please try again.',
      });
    },
  });

  const handleDelete = id => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            triggerMutation({ endPoint: `/address/${id}`, method: 'delete' }),
        },
      ],
    );
  };

  if (isLoading) return <AppLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeader title="My Addresses" navigation={navigation} any_navigation={true}  navigate_to="Profile" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAddress')}
          style={styles.addAddressButton}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={wp(5)} color="#666" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>

        <View style={styles.addressListContainer}>
          {addresses.length > 0 ? (
            addresses.map((address, index) => (
              <View key={address._id || index} style={styles.addressCard}>
                {/* Left: icon + info */}
                <View style={styles.addressLeft}>
                  <View
                    style={[
                      styles.addressIconContainer,
                      { backgroundColor: COLORS.warning },
                    ]}
                  >
                    <Feather name="map-pin" size={wp(5)} color="#000" />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressType}>
                      {address.where || 'Address'}
                    </Text>
                    <Text style={styles.addressText}>{address.address}</Text>
                    {address.set_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Right: edit + delete */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('AddAddress', { address })
                    }
                  >
                    <Feather name="edit-2" size={wp(4)} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.7}
                    onPress={() => handleDelete(address._id)}
                  >
                    <Feather name="trash-2" size={wp(4)} color="#e53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No addresses found</Text>
          )}
        </View>

        {isFetchingNextPage && (
          <ActivityIndicator
            size="small"
            color="#000"
            style={{ marginVertical: hp(2) }}
          />
        )}

        <View style={{ height: hp(10) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Changed background to a slightly off-white for contrast
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },

  // Add Address Screen Styles
  addAddressButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    marginTop: hp(1),
    marginBottom: hp(2),
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  addAddressText: {
    fontSize: wp(4),
    color: '#666',
    marginLeft: wp(2),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
  },
  addressListContainer: {
    // No specific styles needed here, cards handle their own shadow
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5), // Added horizontal padding for the card content
    backgroundColor: '#fff', // Explicitly set background for shadow
    marginBottom: hp(1.5), // Increased margin for separation
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(3),
  },
  addressIconContainer: {
    width: wp(9), // Increased size for better visibility
    height: wp(9), // Increased size
    borderRadius: wp(4.5), // Made circular
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontSize: wp(4),
    fontWeight: '0',
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginBottom: hp(0.5),
  },
  addressText: {
    fontSize: wp(3.5), // Slightly larger font size
    color: '#666',
    lineHeight: wp(5), // Adjusted line height
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  defaultBadge: {
    marginTop: hp(0.5),
    backgroundColor: COLORS.warning,
    alignSelf: 'flex-start',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: wp(2.8),
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  editBtn: {
    padding: wp(2),
  },
  deleteBtn: {
    padding: wp(2),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp(5),
    color: '#777',
    fontFamily: 'Poppins-Regular',
  },
});
