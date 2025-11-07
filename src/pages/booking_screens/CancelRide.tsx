// @ts-nocheck
// Screen 3: Cancel Ride - Select Reason

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image, // 1. Import the Modal component
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Button from '../../components/Button';
import TopHeader from '../../components/TopHeader';
import { useNavigation } from '@react-navigation/native';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useUserStore } from '../../stores/useUserStore';
import { CANCEL_REASONS } from '../../utils/Enums';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';
import { useRideStore } from '../../stores/rideStore';

// Make sure to receive the navigation prop
export default function CancelRide({
  headerShow = true,
  btnText = 'Cancel Ride',
  route,
}) {
  const [selectedReason, setSelectedReason] = useState({
    index: null,
    reason: '',
  });
  const [issueDescription, setIssueDescription] = useState('');
  const navigation = useNavigation(); // ✅ this gives you access to navigate()
  const tabBarHeight = useTabBarHeightHelper();
  const { userData, role } = useUserStore();
  const {setRideRequests} = useRideStore();
  const { rideId } = route.params || {};

  // 2. State to control the modal's visibility
  const [isModalVisible, setModalVisible] = useState(false);

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        setModalVisible(true);
        setRideRequests(data?.data?._id);
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  // Function to handle the final cancellation
  const handleCancelRide = () => {
    if (selectedReason?.index === null || selectedReason?.reason === '') {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Please fill out all fields',
      });
      return;
    }

    const body = {
      ride_id: rideId,
      action: 'cancel',
      category: selectedReason?.reason,
      description: issueDescription,
      action_performer: role,
    };
    triggerMutation({
      endPoint: '/ride/request-ride-action',

      body,
      method: 'post',
    });

    // Then, show the confirmation modal
  };

  const handleGoHome = () => {
    setModalVisible(false);
    // Navigate to the Home screen or any other screen as needed
    navigation.navigate(role === "User"?'Home':'DriverHome');
    if(role === "User"){

    navigation.reset({
      index: 0,
      routes: [{ name: 'Bookings' }], // 👈 take user to Home first
    });

    // Optionally also reset the Booking stack when user revisits it
    setTimeout(() => {
      navigation.navigate('Bookings', {
        screen: 'BookingMain', // 👈 start fresh page 1
      });
    }, 300);
    }

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        {headerShow && (
          <TopHeader
            title="Reason"
            navigation={navigation}
            navigation={navigation}
          />
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + 20 },
          ]}
        >
          {/* Select Issue Category */}
          <View style={[{ marginTop: headerShow ? hp('2%') : 0 }, styles.card]}>
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
                      borderColor: '#F8D833',
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
              <Button isLoading={loading} title={btnText} onPress={handleCancelRide} />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 4. Add the Modal component here */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Image source={require('../../assets/images/sad.png')} />
            <Text style={styles.modalTitle}>
              {!headerShow
                ? "We're so sad about your complain"
                : "We're so sad about your cancellation"}
            </Text>
            <Text style={styles.modalSubtitle}>
              We will continue to improve our service & satisfy you on the next
              trip.
            </Text>

            <View style={styles.btnContainer}>
              <Button title="Back Home" onPress={handleGoHome} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 5. Add new styles for the modal to your StyleSheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  scrollContent: {
    paddingBottom: hp('2%'),
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    padding: wp('5%'),
    paddingTop: hp(3),
    borderRadius: wp('4%'),
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
    backgroundColor: '#F8D833',
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
    backgroundColor: '#F8D833',
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
