//@ts-nocheck

import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';
import Button from './Button';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { COLORS, error_msg } from '../utils/Enums';

export default function PayoutRequest({
  handleConfirmPayout,
  showPayoutModal,
  setShowPayoutModal,
  balance,
  isLoading
}) {
  const [amount, setAmount] = useState(0); // <-- State to store input amount
  const [err_msg, setErr_msg] = useState('');

 const handleAmountChange = (number) => {
  // Remove any non-numeric characters
  const numericValue = parseFloat(number);
  const numericBalance = parseFloat(balance);

  if (number === '' || isNaN(numericValue)) {
    setErr_msg('Must be a valid number');
    setAmount(number); // keep user input
    return;
  }

  if (numericValue > balance) {
    setErr_msg('Cannot exceed available balance');
  } else if (numericValue <= 0) {
    setErr_msg('Amount must be greater than zero');
  } else {
    setErr_msg(''); // valid amount
  }

  setAmount(`${number}`);
};

  return (
    <View>
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
              <Image source={require('../assets/images/dollar.png')} />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Confirm Payout Request</Text>

            {/* Amount Box */}
            <View style={styles.amountBox}>
              <Text style={styles.amountTital}>Enter Amount to Transfer</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="$0.00"
                keyboardType="numeric"
                value={amount}
                placeholderTextColor="#999"
                onChangeText={handleAmountChange}
              />
            </View>
            {err_msg && <Text style={styles.errorText}>{err_msg}</Text>}

            {/* Description */}
            <Text style={styles.modalDescription}>
              Confirming this action will initiate a transfer to your registered
              bank account.
            </Text>

            {/* Confirm Button */}
            <View style={styles.confirmButton}>
              <Button
              disabled={err_msg !== '' || amount === 0}
              isLoading={isLoading}
                title="Confirm Payout"
                onPress={() => handleConfirmPayout(amount)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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

  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    textAlign:"center"
  },
  amountBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.warning,
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
    alignItems: 'center',
  },
  amountTital: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(17, 17, 17, 0.70)',
    textAlign: 'center',
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 30,
    fontWeight: '600',
    color: '#4CD964',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 5,
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

  /* ✅ Success Modal */
  successIconCircle: {
    marginBottom: hp(3),
  },
  errorText: {
    ...error_msg,
    marginBottom: hp(1.5),
  },
});
