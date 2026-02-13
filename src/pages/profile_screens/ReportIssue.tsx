// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import CancelRide from '../booking_screens/CancelRide';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { CANCEL_REASONS, COLORS } from '../../utils/Enums';
import { useUserStore } from '../../stores/useUserStore';
import CustomDropdown from '../../components/CustomDropdown';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import AppLoader from '../../components/AppLoader';
import { formatSmartDate } from '../../utils/DateFormats';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

export default function ReportIssue({ navigation }) {
  const tabBarHeight = useTabBarHeightHelper();
  const { userData, role } = useUserStore();
  const [selectedReason, setSelectedReason] = useState({
    index: null,
    reason: '',
  });
  const [issueDescription, setIssueDescription] = useState('');
  const [selected, setSelected] = useState(null);

  const { data } = useQuery({
    queryKey: ['user-rides'],
    queryFn: () => fetchData('/ride/user-all-ride'),
    keepPreviousData: true,
  });

  const { data: rideData, isLoading } = useQuery({
    queryKey: ['ride_view', selected],
    queryFn: () => fetchData(`/ride/${selected}`),
    keepPreviousData: true,
    enabled: !!selected,
  });

  console.log(data, 'data');

  const options = Array.isArray(data)
    ? data.map(ride => ({
        label: `${ride.pickup_location?.famous_location || 'Pickup'} → ${
          ride.drop_location?.famous_location || 'Dropoff'
        } (${new Date(ride.ride_complete_at).toLocaleDateString()})`,
        value: ride._id, // or whatever unique id the ride has
      }))
    : [];

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?._id) {
        showToast({
          type: 'success',
          title: 'Complain Sent',
          message: 'Your complain has been sent successfully',
        });
        setSelected(null),
        setIssueDescription(''),
        setSelectedReason({
          index: null,
          reason: '',
        })
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Complain Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleSubmit = () => {
    if(!selectedReason.reason || !issueDescription){
      showToast({
        type: 'error',
        title: 'Complain Failed',
        message: 'Please fill out all fields',
      });
      return;
    }
    const data = {
      issue_category: selectedReason.reason,
      message: issueDescription,
      driver: rideData?.data?.driver?._id,
      ride: selected,
    };

    triggerMutation({
      endPoint: '/complain',
      body: data,
      method: 'post',
    });
  };

  if (isLoading) {
    return <AppLoader />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <TopHeader title="Report an Issue" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 35 },
        ]}
      >
        <View style={styles.forContainer}>
          {/* Top Payment Card */}

          <CustomDropdown
            data={options}
            placeholder="Select the ride you want to report"
            value={selected}
            onChange={item => setSelected(item.value)}
          />
          {rideData?.data?._id && (
            <View style={styles.paymentCard}>
              <Text style={styles.issueLabel}>Issue for Trip</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.tripId}>
                  Trip ID: #{rideData?.data?._id?.slice(0, 6)}
                </Text>
                <Text style={styles.amount}>
                  ${rideData?.data?.payment_breakdown?.total_fare?.toFixed(2)}
                </Text>
              </View>

              <View style={styles.dashedLine} />
              <Text style={styles.dateLoc}>
                {formatSmartDate(rideData?.data?.ride_complete_at)} |{' '}
                {rideData?.data?.pickup_location?.famous_location} to{' '}
                {rideData?.data?.drop_location?.famous_location}
              </Text>
            </View>
          )}
        </View>
        <View>
          {/* Select Issue Category */}
          <View style={[styles.card]}>
            <Text style={styles.sectionTitle}>Select Issue Category</Text>

            {CANCEL_REASONS[role]?.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() =>
                  setSelectedReason({ index, reason: reason?.reason })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedReason.index === index && {
                      borderColor: COLORS.warning,
                    }, // Highlight border when selected
                  ]}
                >
                  {selectedReason.index === index ? (
                    <View style={styles.radioButtonSelected} />
                  ) : null}
                </View>
                <Text style={styles.radioLabel}>{reason?.reason}</Text>
              </TouchableOpacity>
            ))}

            {/* Describe the Issue */}
            <View style={styles.description}>
              <Text style={styles.sectionTitle}>Describe the Issue</Text>

              <TextInput
                style={styles.textArea}
                placeholder="Please provide details of your experience"
                placeholderTextColor="#999"
                value={issueDescription}
                onChangeText={setIssueDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.btnContainer}>
              {/* 3. Add onPress to trigger the modal */}
              <Button isLoading={loading} onPress={handleSubmit} title={'Submit Complain'} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
  },
  forContainer: {
    paddingHorizontal: wp('5%'),
  },
  // Card Styles
  paymentCard: {
    backgroundColor: '#fff',

    elevation: 1,
    borderRadius: 12,
    padding: wp(5),
    marginBottom: hp(Platform.OS === 'ios' ? 0 : 3),

  },

  issueLabel: {
    fontSize: wp(5),
    color: '#000',
  },

  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  tripId: {
    color: 'rgba(17, 17, 17, 0.70)',
  },
  amount: {
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: hp(2),
  },
  dateLoc: {
    fontSize: wp(3),

    color: 'rgba(17, 17, 17, 0.70)',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    padding: wp('5%'),
    paddingTop: hp(3),
    borderRadius: wp('4%'),
                elevation: 1,

    // marginTop: hp(3),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('2%'),
    fontFamily: 'SF Pro',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  radioButton: {
    width: wp('5.5%'),
    height: wp('5.5%'),
    borderRadius: wp('2.75%'),
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'SF Pro',
  },
  radioButtonSelected: {
    width: wp('3%'),
    height: wp('3%'),
    borderRadius: wp('1.5%'),
    backgroundColor:COLORS.warning ,
  },
  radioLabel: {
    fontSize: wp('3.8%'),
    color: '#333',
    flex: 1,
  },
  textArea: {
    backgroundColor: '#F8F8F8',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    fontSize: wp('3.8%'),
    color: '#000',
    minHeight: hp('15%'),
    borderWidth: 1,
    borderColor: '#CFCFCF',
    fontFamily: 'SF Pro',
  },
  description: {
    marginTop: hp(3),
    fontFamily: 'SF Pro',
  },
  btnContainer: {
    marginTop: hp(3),
    width: '100%',
  },
  // --- MODAL STYLES ---
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: wp('85%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,

    fontFamily: 'SF Pro',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 25,

    fontFamily: 'SF Pro',
  },
  modalButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'SF Pro',

    fontWeight: '600',
  },
});
