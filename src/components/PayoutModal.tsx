//@ts-nocheck


import { View, Text, Modal, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import Button from './Button'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { COLORS } from '../utils/Enums';

export default function PayoutModal({showSuccessModal, setShowSuccessModal , amount}) {
  return (
    <View>
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
                   <Image source={require('../assets/images/check.png')} />
                 </View>
     
                 {/* Title */}
                 <Text style={styles.successTitle}>Payout Submitted!</Text>
     
                 {/* Description */}
                 <Text style={styles.successDescription}>
                   Your request for{' '}
                   <Text style={{ fontWeight: '700' }}>${amount}</Text> has been
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
    </View>
  )
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
})