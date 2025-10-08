//@ts-nocheck

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
    Dimensions,
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
import TopHeader from '../../components/TopHeader';

const { width, height } = Dimensions.get('window');




export const AddNewAddressScreen = ({ navigation }) => {
  const [addresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: 'Apartment 101, Palm View Towers, 123 Main Street,',
      icon: 'home',
      color: '#FDD835',
    },
    {
      id: 2,
      type: 'Work',
      address: 'Apartment 101, Palm View Towers, 123 Main Street,',
      icon: 'briefcase',
      color: '#FDD835',
    },
    {
      id: 3,
      type: 'Home',
      address: 'Apartment 101, Palm View Towers, 123 Main Street,',
      icon: 'map-pin',
      color: '#FDD835',
    },
    {
      id: 4,
      type: 'Home',
      address: 'Apartment 101, Palm View Towers, 123 Main Street,',
      icon: 'map-pin',
      color: '#FDD835',
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
     <TopHeader title='Add New Address' navigation={navigation}/>

      <ScrollView style={styles.scrollView}  showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}

      >
        {/* Add New Address Button */}
        <TouchableOpacity style={styles.addAddressButton} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={wp(5)} color="#666" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>

        {/* Address List */}
        <View style={styles.addressListContainer}>
          {addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressLeft}>
                <View style={[styles.addressIconContainer, { backgroundColor: address.color }]}>
                  <Feather name={address.icon} size={wp(5)} color="#000" />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressType}>{address.type}</Text>
                  <Text style={styles.addressText}>{address.address}</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Feather name="edit-2" size={wp(4.5)} color="#999" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: hp(10) }} />
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Changed background to a slightly off-white for contrast
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
   scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },


  // Add Address Screen Styles
  addAddressButton: {
    width:"100%",
    flexDirection: 'row',
    justifyContent:"center",
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    marginTop: hp(1),
    marginBottom: hp(2),
    borderRadius:10,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  addAddressText: {
    fontSize: wp(4),
    color: '#666',
    marginLeft: wp(2),
    fontWeight: '500',
  },
  addressListContainer: {
    // No specific styles needed here, cards handle their own shadow
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5), // Added horizontal padding for the card content
    backgroundColor: '#fff', // Explicitly set background for shadow
    marginBottom: hp(1.5), // Increased margin for separation
    borderRadius:10,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(3),
  },
  addressIconContainer: {
    width: wp(9), // Increased size for better visibility
    height: wp(9), // Increased size
    borderRadius: wp(4.5), // Made circular
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
    fontSize: wp(3.5), // Slightly larger font size
    color: '#666',
    lineHeight: wp(5), // Adjusted line height
  },
});