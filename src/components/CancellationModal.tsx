import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal, // Standard React Native Modal
  TouchableWithoutFeedback,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface CancelModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  subTitle?: string;
}

const CancellationModal: React.FC<CancelModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title = "Cancel Ride?",
  subTitle = "Are you sure you want to cancel this ride? This action cannot be undone.",
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true} // Crucial: shows the screen data behind the modal
      animationType="fade" // Built-in options: none, slide, fade
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* This Touchable makes the background dim and clickable to close */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          
          {/* Prevent clicks inside the white box from closing the modal */}
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subTitle}>{subTitle}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelBtn]} 
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Go Back</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, styles.confirmBtn]} 
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmText}>Cancel Ride</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dims the background data
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
  },
  container: {
    width: wp(85), 
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    padding: wp(6),
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: wp(5),
    color: '#000000',
    marginBottom: hp(1.5),
    textAlign: 'center',
    fontWeight: '700', 
  },
  subTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: wp(3.8),
    color: '#666666',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: wp(5.5),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    height: hp(6),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(1.5),
  },
  cancelBtn: {
    backgroundColor: '#E0E0E0', 
  },
  confirmBtn: {
    backgroundColor: '#FF3B30', 
  },
  cancelText: {
    fontFamily: 'Poppins-Regular',
    color: '#333333',
    fontSize: wp(3.8),
  },
  confirmText: {
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    fontSize: wp(3.8),
  },
});

export default CancellationModal;