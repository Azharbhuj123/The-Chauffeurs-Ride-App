// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useTabBarHeightHelper } from '../../utils/TabBarHeight';
import { useRideStore } from '../../stores/rideStore';
import { useUserStore } from '../../stores/useUserStore';

// ProfileMainScreen Component
export const ProfileMainScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const tabBarHeight = useTabBarHeightHelper();
  const { userData, resetAll } = useUserStore();

  const menuItems = [
    { id: 1, icon: 'user', label: 'Edit Profile', screen: 'EditProfile' },
    { id: 2, icon: 'map-pin', label: 'Address', screen: 'Address' },
    { id: 3, icon: 'clock', label: 'Trip History', screen: 'TripHistory' },
    { id: 4, icon: 'alert-circle', label: 'Complain', screen: 'ReportIssue' },
    { id: 5, icon: 'credit-card', label: 'Payment Options', screen: 'Payment' },
    { id: 6, icon: 'info', label: 'About Us', screen: 'About' },
    { id: 7, icon: 'settings', label: 'Settings', screen: 'Settings' },
    {
      id: 8,
      icon: 'help-circle',
      label: 'Help and Support',
      screen: 'Support',
    },
  ];

  const handleLogout = () => {
    setModalVisible(false);
    resetAll();

    navigation.navigate('Login');
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: tabBarHeight + 50 }]}
      >
        {/* Profile Section */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.profileSection}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userData?.profile_image }}
              style={styles.profileImage}
            />
            <View style={styles.editBadge}>
              <Ionicons name="camera-outline" size={wp(4.5)} color="#000" />
            </View>
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>note@email.com</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation?.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Feather name={item.icon} size={wp(5)} color="#666" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={wp(5)} color="#999" />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Feather name="log-out" size={wp(5)} color="#FF3B30" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  // Profile Main Screen Styles
  profileSection: {
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: hp(2),
    borderWidth: 2,
    borderColor: '#F8D833',
    borderRadius: wp(12.5),
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F8D833',
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: wp(5),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.5),
    fontFamily: 'SF Pro',
  },
  profileEmail: {
    fontSize: wp(3.5),
    color: '#666',
    fontFamily: 'SF Pro',
  },
  menuContainer: {
    paddingHorizontal: wp(5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
    paddingRight: 10,
    paddingLeft: 5,
    backgroundColor: '#F5F5F5',
    marginBottom: hp(2),
    borderRadius: 6,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  menuLabel: {
    fontSize: wp(4),
    color: '#000',
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
  },
  logoutText: {
    fontSize: wp(4),
    color: '#FF3B30',
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  // Edit Profile Screen Styles
  editProfileImageSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: hp(4),
    marginBottom: hp(2),
  },
  tapToChangeText: {
    fontSize: wp(3.5),
    color: '#666',
    marginTop: hp(1),
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    marginBottom: hp(2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    height: hp(6.5),
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: wp(4),
    color: '#000',
    padding: 0,
  },
  saveButton: {
    backgroundColor: '#F8D833',
    marginHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    marginBottom: hp(2),
    fontFamily: 'SF Pro',
  },
  saveButtonText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SF Pro',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'SF Pro',
  },
  // Add Address Screen Styles
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
    fontFamily: 'SF Pro',
  },
  addAddressText: {
    fontSize: wp(4),
    color: '#666',
    marginLeft: wp(2),
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  addressListContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(3),
  },
  addressIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp(0.5),
  },
  addressText: {
    fontSize: wp(3.3),
    color: '#666',
    lineHeight: wp(4.5),
    fontFamily: 'SF Pro',
  },

  // Model

  
});

export default ProfileMainScreen;
