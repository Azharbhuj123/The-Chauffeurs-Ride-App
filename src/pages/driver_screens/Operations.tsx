// @ts-nocheck

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useUserStore } from '../../stores/useUserStore';
import Button from '../../components/Button';
import { COLORS } from '../../utils/Enums';

const Operations = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
  
  const { userData, resetAll } = useUserStore();

    const handleLogout = () => {
    setModalVisible(false);
    resetAll();

    navigation.navigate('Login');
  };
  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Operations" navigation={navigation} />

      <ScrollView
        style={styles.bottomSpacing}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.OperationsBox}>
          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => navigation.navigate('RatingsReviewsScreen')}
          >
            <View style={styles.OperationsIconBox}>
              <Image source={require('../../assets/images/Ratings.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Ratings & Reviews
              </Text>
              <Text style={styles.OperationsCardPara}>
                View Passenger feedback, rating.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => navigation.navigate('DynamicPricingTool')}
          >
            <View style={styles.OperationsIconBox}>
              <Image source={require('../../assets/images/Tool.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Dynamic Pricing Tool
              </Text>
              <Text style={styles.OperationsCardPara}>
                Adjust base fares, per-mile rates, and demand.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => navigation.navigate('NotificationsAlerts')}
          >
            <View style={styles.OperationsIconBox}>
              <Image source={require('../../assets/images/Alerts.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Notifications & Alerts
              </Text>
              <Text style={styles.OperationsCardPara}>
                Manage alert toggles, delivery methods.
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.OperationsCard}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.OperationsIconBox}>
              <Image style={{ width: 30, height: 30 }} source={require('../../assets/images/logout.png')} />
            </View>
            <View style={styles.OperationsCardTital}>
              <Text style={styles.OperationsCardHeading}>
                Logout
              </Text>
              <Text style={styles.OperationsCardPara}>
Safely log out from your account.              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
                  <Image source={require('../../assets/images/logout.png')} />
                  <Text style={styles.modalTitle}>Confirm Logout</Text>
                  <Text style={styles.modalSubtitle}>
                    Are you sure you want to log out of your PrimeRide account? You
                    will need to sign in again to book a ride.{' '}
                  </Text>
      
                  <View style={styles.btnContainer}>
                    <Button
                      title="Logout"
                      textColor="white"
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
    </SafeAreaView>
  );
};

export default Operations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  OperationsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 20,
  },
  OperationsCard: {
    width: '100%',
    borderRadius: 6,
    padding: wp(5),
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5, // for Android shadow

    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },

  OperationsIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  OperationsCardTital: {},

  OperationsCardHeading: {
    color: '#5A5A5A',
    fontSize: 15,

    fontWeight: '0',
        fontFamily:"Poppins-Regular",
  },

  OperationsCardPara: {
    color: 'rgba(17, 17, 17, 0.70)',
    fontSize: 12,

    fontWeight: '400',
    marginTop: 5,
  },

  bottomSpacing: {
    marginBottom: 100,
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
    fontWeight: '0',
        fontFamily:"Poppins-Regular",
    fontFamily: 'Poppins-Regular',
  },
  btnContainer: {
    width: '100%',
  },
});
