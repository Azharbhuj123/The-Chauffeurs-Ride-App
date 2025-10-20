import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import Button from '../../components/Button';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const DetailedRevenue = ({ navigation }) => {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 🟡 Function to handle Confirm click
  const handleConfirmPayout = () => {
    setShowPayoutModal(false);
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 300); // little delay for smooth transition
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Detailed Revenue Breakdown" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earnings Chart Section */}
        <View style={styles.reportsCard}>
          <Text style={styles.reportTitle}>Monthly Net Earnings Trend</Text>
          <View style={styles.reportPlaceholderbox}>
            <Text style={styles.reportPlaceholder}>
              [Placeholder: Chart showing Net Earnings vs. Fare over time]
            </Text>
          </View>
        </View>

        {/* Platform Fee Breakdown */}
        <View style={styles.reportsCard}>
          <Text style={styles.reportTitle}>Platform Fee Breakdown</Text>
          <Text style={styles.reportSubtitle}>
            Total collected in Platform Fees (15%) for the month:
            <Text style={styles.reportprice}> $432.00</Text>
          </Text>

          <View style={styles.PlatformFeebox}>
            <View style={styles.Platformredbox}>
              <Text style={styles.PlatformredboxTitle}>
                Operational Costs (Mock):
              </Text>
              <Text style={styles.PlatformredboxPrice}>-$150.00</Text>
            </View>

            {/* 🟢 Green Box Click to open Modal */}
            <TouchableOpacity
              style={styles.Platformgreenbox}
              onPress={() => setShowPayoutModal(true)}
            >
              <Text style={styles.PlatformgreenboxTitle}>
                Net Profit from Fees:
              </Text>
              <Text style={styles.PlatformgreenboxPrice}>+$282.00</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 💲 Confirm Payout Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showPayoutModal}
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* ❌ Close Icon */}
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setShowPayoutModal(false)}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            {/* Dollar Icon Circle */}
            <View style={styles.successIconCircle}>
              <Image source={require('../../assets/images/dollar.png')} />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Confirm Payout Request</Text>

            {/* Amount Box */}
            <View style={styles.amountBox}>
              <Text style={styles.amountTital}>Pending Amount to Transfer</Text>
              <Text style={styles.amountText}>$320.00</Text>
            </View>

            {/* Description */}
            <Text style={styles.modalDescription}>
              Confirming this action will initiate a transfer to your registered
              bank account.
            </Text>

            {/* Confirm Button */}
            <View style={styles.confirmButton}>
              <Button title="Confirm Payout" onPress={handleConfirmPayout} />
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Success Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* ❌ Close Icon */}
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            {/* Checkmark Icon */}
            <View style={styles.successIconCircle}>
              <Image source={require('../../assets/images/check.png')} />
            </View>

            {/* Title */}
            <Text style={styles.successTitle}>Payout Submitted!</Text>

            {/* Description */}
            <Text style={styles.successDescription}>
              Your request for{' '}
              <Text style={{ fontWeight: '700' }}>$320.00</Text> has been
              successfully submitted. The funds should reflect in your account
              within 1–3 business days.
            </Text>

            {/* Done Button */}
            <View style={styles.doneButton}>
              <Button title="Done" onPress={() => setShowSuccessModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  reportsCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.10)',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 50,
    marginBottom: 30,
  },

  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  reportPlaceholderbox: {
    padding: 16,
    backgroundColor: '#F4F4F4',
    height: 225,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.10)',
  },
  reportPlaceholder: { fontSize: 14, color: '#000', textAlign: 'center' },
  reportSubtitle: { color: '#111', fontSize: 14, fontWeight: '400' },
  reportprice: { color: '#4CD964', fontSize: 14, fontWeight: '600' },

  PlatformFeebox: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
  },
  Platformredbox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF3A2F',
    backgroundColor: 'rgba(255, 58, 47, 0.10)',
    padding: 16,
  },
  PlatformredboxTitle: { color: '#FF3A2F', fontSize: 14, fontWeight: '400' },
  PlatformredboxPrice: { color: '#FF3A2F', fontSize: 10, fontWeight: '700' },

  Platformgreenbox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4CD964',
    backgroundColor: 'rgba(76, 217, 100, 0.10)',
    padding: 16,
  },
  PlatformgreenboxTitle: { color: '#4CD964', fontSize: 14, fontWeight: '400' },
  PlatformgreenboxPrice: { color: '#4CD964', fontSize: 10, fontWeight: '700' },

  /* 💲 Modal Styles */
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
    position: 'relative',
  },

  closeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 10,
    zIndex: 1,
    padding: 5,
  },
  closeIcon: { fontSize: 22, color: '#111' },

  iconCircle: {
    backgroundColor: 'rgba(255, 214, 0, 0.15)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: { fontSize: 22, color: '#FFA300' },

  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  amountBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#F8D833',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 50,
    elevation: 3,
  },
  amountTital: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(17, 17, 17, 0.70)',
    textAlign: 'center',
    marginBottom: 10,
  },
  amountText: {
    fontSize: 30,
    fontWeight: '600',
    color: '#4CD964',
    textAlign: 'center',
  },
  modalDescription: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  confirmButton: {
    width: '100%',
    marginTop: 10,
  },
  confirmButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },

  /* ✅ Success Modal */
  successIconCircle: {
    marginBottom: hp(3),
  },
  successIcon: { fontSize: 28, color: '#4CD964' },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  successDescription: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    marginBottom: 20,
    lineHeight: 20,
  },
  doneButton: {
    width: '100%',
  },
  doneButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },
});

export default DetailedRevenue;
