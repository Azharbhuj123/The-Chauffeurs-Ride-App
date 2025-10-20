import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';

const CustomerProfile = ({ navigation }) => {
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSaveNotes = () => setShowModal(true);
  const handleConfirm = () => {
    setShowModal(false);
    setShowSuccessModal(true);
  };
  const handleDone = () => setShowSuccessModal(false);

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="John Williams" navigation={navigation} />

      <ScrollView
        style={styles.bottomSpacing}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact & Loyalty Info */}
        <Text style={styles.contactHeading}>Contact & Loyalty Info</Text>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>John Williams</Text>
              <View style={styles.loyaltyTag}>
                <Text style={styles.loyaltyText}>Platinum</Text>
              </View>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStar}>
                <Icon name="star" size={20} color="#F8D833" />
              </Text>
              <Text style={styles.ratingValue}>4.9</Text>
            </View>
          </View>
          <View style={styles.infoRowBox}>
            <View style={styles.infoRow}>
              <Image
                source={require('../../assets/images/phone.png')}
                style={styles.infoLabel}
              />
              <Text style={styles.infoText}>+1 987 654 3210</Text>
            </View>

            <View style={styles.infoRow}>
              <Image
                source={require('../../assets/images/date.png')}
                style={styles.infoLabel}
              />
              <Text style={styles.infoText}>Last: Oct 5, 2025</Text>
            </View>
          </View>

          <View style={styles.infoRowBox}>
            <View style={styles.infoRow}>
              <Image
                source={require('../../assets/images/caricon1.png')}
                style={styles.infoLabel}
              />
              <Text style={styles.infoText}>12 Total Rides</Text>
            </View>

            <View style={styles.infoRow}>
              <Image
                source={require('../../assets/images/Loyalty.png')}
                style={styles.infoLabel}
              />
              <Text style={styles.infoText}>85% Loyalty</Text>
            </View>
          </View>
        </View>
        <View style={styles.sectionBox}>
          {/* Booking History */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booking History</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>All Time ▼</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.totalRides}>Total Rides: 12</Text>

          {[
            { date: 'Oct 5, 25', route: 'Home → Airport', price: '$85.00' },
            { date: 'Sep 28, 25', route: 'Office → Driver', price: '$45.00' },
            { date: 'Sep 10, 25', route: 'Hotel → Meeting', price: '$120.00' },
          ].map((item, idx) => (
            <View style={styles.bookingCard} key={idx}>
              <View>
                <Text style={styles.bookingDate}>{item.date}</Text>
                <Text style={styles.bookingRoute}>{item.route}</Text>
              </View>
              <Text style={styles.bookingPrice}>{item.price}</Text>
            </View>
          ))}
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
                placeholderTextColor="#666" // 👈 darker placeholder
                multiline
                numberOfLines={4}
                textAlignVertical="top" // keeps text starting from top
              />
            </View>
            <View>
              <Button title="Save Notes" onPress={handleSaveNotes} />
            </View>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: '#F1F2F4',
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
    elevation: 5, // for Android shadow
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
});

export default CustomerProfile;
