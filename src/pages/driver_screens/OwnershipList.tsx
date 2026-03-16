import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../queryFunctions/queryFunctions';
import { useFocusEffect } from '@react-navigation/native';
import { formatReadableDate, formatSmartDate } from '../../utils/DateFormats';
import SkeletonBox from '../../utils/SkeletonBox';

const OwnershipList = ({ navigation }) => {
  const [notes, setNotes] = useState('Saved locally in client ledger.');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSaveNotes = () => setShowModal(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['client-ownership', search],
    queryFn: () => fetchData(`/driver/client-ownership?search=${search}&page=1&limit=10`),
    keepPreviousData: true,
  });

  const client_list = data?.data;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  console.log(data, 'data');

  const handleConfirm = () => {
    setShowModal(false);
    setShowSuccessModal(true);
  };
  const handleDone = () => setShowSuccessModal(false);

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Client Ownership" navigation={navigation} />

      <ScrollView
        style={styles.bottomSpacing}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputBox}>
          <Image
            source={require('../../assets/images/Search.png')}
            style={styles.inputBoxIcon}
          />
          <TextInput
            onChangeText={text => setSearch(text)}
            placeholder="Search by client name or phone number..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Contact & Loyalty Info */}
        <Text style={styles.contactHeading}>Client List</Text>
        {isLoading ? (
  <>
    <SkeletonBox height={200} marginTop={0} />
    <SkeletonBox height={200} marginTop={0} />
    <SkeletonBox height={200} marginTop={0} />
  </>
) : client_list?.length === 0 ? (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(5),
    }}
  >
    <Text
      style={{ fontSize: wp(4), fontStyle: 'italic', color: '#999' }}
    >
      No Client Found
    </Text>
  </View>
) : (
  client_list?.map(customer => (
    <TouchableOpacity
      key={customer._id}
      style={styles.card}
      onPress={() => navigation.navigate('CustomerProfile',{
        customerId:customer._id,
        customer,
      })}
    >
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Image
            source={{ uri: customer?.profile_image }}
            style={{ width: '100%', height: '100%', borderRadius: 50 }}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{customer.name}</Text>
          {customer.category && (
            <View
              style={[
                styles.loyaltyTag,
                customer.category && styles[customer.category],
              ]}
            >
              <Text style={styles.loyaltyText}>{customer.category}</Text>
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
          <Text style={styles.infoText}>{customer.totalRides} Total Rides</Text>
        </View>

        <View style={styles.infoRow}>
          <Image
            source={require('../../assets/images/Loyalty.png')}
            style={styles.infoLabel}
          />
          <Text style={styles.infoText}>{customer.loyaltyPercent}% Loyalty</Text>
        </View>
      </View>
    </TouchableOpacity>
  ))
)}


        {/* Operator Notes */}

        <View style={styles.sectionBox}>
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Analytics & Insights</Text>
          </View>

          <View style={styles.ClientsBox}>
            <View style={[styles.ClientsCard, styles.newbox1]}>
              <Text style={styles.ClientsCardHeading}>
                {data?.totalClients}
              </Text>
              <Text style={styles.ClientsCardPara}>Total Clients</Text>
            </View>

            <View style={[styles.ClientsCard, styles.newbox2]}>
              <Text style={styles.ClientsCardHeading}>
                {data?.repeatClients}
              </Text>
              <Text style={styles.ClientsCardPara}>Repeat Clients</Text>
            </View>

            <View style={[styles.ClientsCard, styles.newbox3]}>
              <Text
                style={[styles.ClientsCardHeading, styles.ClientsCardHeading1]}
              >
                Top {data?.topLoyalClientsCount} Loyal Clients:
              </Text>
              <Text style={[styles.ClientsCardPara, styles.ClientsCardPara1]}>
                {data?.topLoyalClients}
              </Text>
            </View>

            <View style={[styles.ClientsCard, styles.newbox4]}>
              <Text style={styles.ClientsCardPara}>
                [Placeholder: Lifetime Client Value Graph]
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

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
    marginTop: 0,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  Bronze: {
    backgroundColor: '#7A4400',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontWeight: '700', color: '#000' },
  name: { fontSize: 14, fontWeight: '0',
        fontFamily:"Poppins-Regular", color: '#000' },

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
    fontWeight: '0',
        fontFamily:"Poppins-Regular",
    marginLeft: 4,
    fontSize: 20,
  },
  Gold: {
    backgroundColor: '#FFD600',
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
    fontWeight: '0',
        fontFamily:"Poppins-Regular",
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
    elevation: 5, // for Android shadow
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

  bookingDate: { fontSize: 14, fontWeight: '0',
        fontFamily:"Poppins-Regular", color: '#000' },
  bookingRoute: { fontSize: 12, color: '#666', marginTop: 10 },
  bookingPrice: { fontSize: 16, fontWeight: '0',
        fontFamily:"Poppins-Regular", color: '#4CD964' },
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
  saveButton: {
    backgroundColor: '#FFD600',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
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
  inputBoxIcon: {
    width: 15,
    height: 15,
  },

  modalButton: {
    backgroundColor: '#FFD600',
    borderRadius: 30,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: { color: '#000', fontWeight: '0',
        fontFamily:"Poppins-Regular", fontSize: 14 },

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
  },

  bottomSpacing: {
    marginBottom: 100,
  },

  contactHeading: {
    fontSize: 16,
    fontWeight: '0',
        fontFamily:"Poppins-Regular",
    color: '#000',
    marginHorizontal: 16,
    marginBottom: hp(3),
  },

  ClientsCard: {
    padding: wp(6),
    borderRadius: 14,
  },

  ClientsCardHeading: {
    fontSize: 24,
    fontWeight: '0',
        fontFamily:"Poppins-Regular",
    color: '#000',
    textAlign: 'center',
  },
  ClientsCardHeading1: {
    textAlign: 'left',
    fontSize: 14,
  },
  ClientsCardPara: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  ClientsCardPara1: {
    textAlign: 'left',
  },
  ClientsBox: {
    flexDirection: 'row', // to arrange children horizontally
    flexWrap: 'wrap', // wraps items to next line
    justifyContent: 'space-between',
    gap: 10, // supported in newer React Native versions
  },

  newbox1: {
    width: '48%',
    backgroundColor: 'rgba(76, 217, 100, 0.10)',
  },

  newbox2: {
    width: '48%',
    backgroundColor: 'rgba(248, 216, 51, 0.10)',
  },
  newbox3: {
    width: '100%',
    backgroundColor: 'rgba(5, 25, 243, 0.10)',
  },
  newbox4: {
    width: '100%',
    backgroundColor: '#F4F4F4',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputBox: {
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    alignItems: 'center',
    padding: 16,
  },
});

export default OwnershipList;
