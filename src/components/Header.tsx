// @ts-nocheck
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Logout from 'react-native-vector-icons/MaterialIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useUserStore } from '../stores/useUserStore';
import { COLORS } from '../utils/Enums';
import Button from './Button';

export default function UserHeader({ navigation }) {
  const { token, userData, role, resetAll } = useUserStore();
  const [isModalVisible, setModalVisible] = useState(false);

  const hour = new Date().getHours();

  // Determine greeting
  let greeting = '';
  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }
  const handleLogout = () => {
    setModalVisible(false);
    resetAll();

    navigation.navigate('Login');
  };
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greetingText}>{greeting}</Text>

        <View style={styles.nameContainer}>
          <Text style={styles.userName}>Welcome, {userData?.name}</Text>
          <View style={styles.onlineDot} />
        </View>
      </View>
      {role === 'Driver' ? (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.profileButton}
        >
          <Logout name="logout" size={wp('6%')} color="#FFD700" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="notifications-outline" size={wp('6%')} color="#FFD700" />
        </TouchableOpacity>
      )}

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
            <Image source={require('../assets/images/logout.png')} />
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to log out of your PrimeRide account? You
              will need to sign in again to book a ride.{' '}
            </Text>

            <View style={styles.btnContainer}>
              <Button
                title="Logout"
                textColor="#fff"
                color="#FF3A2F"
                onPress={handleLogout}
              />
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                color="#F1F1F1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('4'),
  },
  greetingText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: wp('6%'),
    fontWeight: '590',
    color: '#000',
    fontFamily: 'SF Pro Display',
  },
  onlineDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: COLORS.success, // ✅ bright green
    marginLeft: wp('2%'),
  },
  profileButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#131104',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },

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
    fontFamily: 'Poppins-Regular',

    marginTop: 15,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',

    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
  },
  modalButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  btnContainer: {
    width: '100%',
  },
});
