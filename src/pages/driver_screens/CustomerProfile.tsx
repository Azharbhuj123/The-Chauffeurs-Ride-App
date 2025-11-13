import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  StatusBar,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useQuery } from '@tanstack/react-query';
import { formatSmartDate } from '../../utils/DateFormats';
import SkeletonBox from '../../utils/SkeletonBox';
import useActionMutation from '../../queryFunctions/useActionMutation';
import { showToast } from '../../utils/toastHelper';

const CustomerProfile = ({ navigation, route }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const tabBarHeight = useTabBarHeightHelper();
  const [notes, setNotes] = useState('');

  const { customerId, customer } = route.params || {};

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['client-ownership-id', customerId],
    queryFn: () => fetchData(`/driver/client-ownership/${customerId}`),
    keepPreviousData: true,
  });

  const totalRides = data?.totalRides?.data;

  console.log(data, 'data');

  useEffect(() => {
    if (data?.success && data?.operatorNotes) {
      setNotes(data?.operatorNotes?.note);
    }
  }, [data]);

  const { triggerMutation, loading } = useActionMutation({
    onSuccessCallback: async data => {
      if (data?.success) {
        showToast({
          type: 'success',
          message: data?.message,
        });
        refetch();
      }
    },
    onErrorCallback: errmsg => {
      showToast({
        type: 'error',
        title: 'Notes Failed',
        message: errmsg || 'Please Try again!',
      });
    },
  });

  const handleSaveNotes = () => {
    const data_obj = {
      note: notes,
      userid: customerId,
    };

    triggerMutation({
      endPoint: '/driver/operator-notes',
      body: data_obj,
      method: 'post',
    });
  };
  const handleConfirm = () => {
    setShowModal(false);
    setShowSuccessModal(true);
  };
  const handleDone = () => setShowSuccessModal(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeader title="John Williams" navigation={navigation} />

      {/* 👇 KeyboardAvoidingView should wrap TouchableWithoutFeedback + ScrollView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: tabBarHeight + (Platform.OS === 'ios' ? 30 : 20),
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Contact & Loyalty Info */}
            <Text style={styles.contactHeading}>Contact & Loyalty Info</Text>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.avatar}>
                  <Image
                    source={{ uri: customer?.profile_image }}
                    style={{ width: '100%', height: '100%', borderRadius: 50 }}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{customer?.name}</Text>
                  {customer.category && (
                    <View
                      style={[
                        styles.loyaltyTag,
                        customer.category && styles[customer.category],
                      ]}
                    >
                      <Text style={styles.loyaltyText}>
                        {customer.category}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingBox}>
                  <Icon name="star" size={20} color="#F8D833" />
                  <Text style={styles.ratingValue}>N/A</Text>
                </View>
              </View>

              <View style={styles.infoRowBox}>
                <View style={styles.infoRow}>
                  <Image
                    source={require('../../assets/images/phone.png')}
                    style={styles.infoLabel}
                  />
                  <Text style={styles.infoText}>{customer.contact}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Image
                    source={require('../../assets/images/date.png')}
                    style={styles.infoLabel}
                  />
                  <Text style={styles.infoText}>
                    Last: {formatSmartDate(customer?.lastRideAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRowBox}>
                <View style={styles.infoRow}>
                  <Image
                    source={require('../../assets/images/caricon1.png')}
                    style={styles.infoLabel}
                  />
                  <Text style={styles.infoText}>
                    {customer.totalRides} Total Rides
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Image
                    source={require('../../assets/images/Loyalty.png')}
                    style={styles.infoLabel}
                  />
                  <Text style={styles.infoText}>
                    {customer.loyaltyPercent}% Loyalty
                  </Text>
                </View>
              </View>
            </View>

            {/* Booking History */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Booking History</Text>
                {/* <TouchableWithoutFeedback>
                  <View style={styles.filterButton}>
                    <Text style={styles.filterText}>All Time ▼</Text>
                  </View>
                </TouchableWithoutFeedback> */}
              </View>
              <Text style={styles.totalRides}>
                Total Rides: {data?.totalRides?.totalItems}
              </Text>
              {isLoading ? (
                <View>
                  <SkeletonBox height={70} marginTop={20} />
                  <SkeletonBox height={70} marginTop={20} />
                  <SkeletonBox height={70} marginTop={20} />
                </View>
              ) : (
                totalRides?.map((item, idx) => (
                  <View style={styles.bookingCard} key={idx}>
                    <View>
                      <Text style={styles.bookingDate}>
                        {formatSmartDate(item.ride_complete_at)}
                      </Text>
                      <Text style={styles.bookingRoute}>
                        {item?.pickup_location?.famous_location} ➞{' '}
                        {item?.drop_location?.famous_location}
                      </Text>
                    </View>
                    <Text style={styles.bookingPrice}>
                      $
                      {Number(item?.payment_breakdown?.driver_earning)?.toFixed(
                        2,
                      )}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Operator Notes */}
            <View style={styles.sectionBox}>
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Operator Notes</Text>
                <Text style={styles.notesSectionPara}>
                  Saved locally in client ledger.
                </Text>

                <View style={styles.sectionTextBox}>
                  <TextInput
                    style={styles.notesSectionPara}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Prefers Mercedes S-Class, always airport pickups."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <Button
                  isLoading={loading}
                  title="Save Notes"
                  onPress={handleSaveNotes}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  card: {
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontWeight: '700', color: '#000' },
  name: { fontSize: 14, fontWeight: '600', color: '#000' },

  loyaltyTag: {
    backgroundColor: '#0519F3',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  loyaltyText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingStar: { fontSize: 16 },
  ratingValue: {
    color: '#FFD600',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 20,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoLabel: { fontSize: 13, marginRight: 8 },
  infoText: { fontSize: 13, color: '#000', fontWeight: '500' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  filterButton: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#DFDFDF',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    paddingHorizontal: 20,

    paddingVertical: 10,
  },

  filterText: { fontSize: 12, color: '#000' },
  totalRides: {
    color: '#000',
    fontSize: 14,
    fontWeight: 600,
  },

  bookingCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,

    borderColor: 'rgba(17, 17, 17, 0.02)',
    backgroundColor: 'rgba(17, 17, 17, 0.02)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  bookingDate: { fontSize: 14, fontWeight: '600', color: '#000' },
  bookingRoute: { fontSize: 12, color: '#666', marginTop: 10 },
  bookingPrice: { fontSize: 16, fontWeight: '600', color: '#4CD964' },
  notesBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.10)',
    textAlignVertical: 'top',
    marginBottom: 10,
  },

  saveButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#FFD600',
    borderRadius: 30,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: { color: '#000', fontWeight: '600', fontSize: 14 },

  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76,217,100,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successTick: { fontSize: 28, color: '#4CD964' },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },

  infoRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  notesSectionPara: {
    fontSize: 14,
    color: '#000',
  },
  sectionBox: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.10)',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 50,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  notesSection: {},

  sectionTextBox: {
    height: 170,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.10)',
    padding: 16,
    marginVertical: 20,
    color: '#000',
  },

  bottomSpacing: {
    marginBottom: 100,
  },

  contactHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: wp(6),
    marginTop: hp(2),
  },
  Bronze: {
    backgroundColor: '#7A4400',
  },
  Gold: {
    backgroundColor: '#FFD600',
  },
});

export default CustomerProfile;
