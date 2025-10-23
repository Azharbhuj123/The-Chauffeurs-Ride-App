// @ts-nocheck
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from "react-native-vector-icons/Ionicons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function UserHeader() {


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

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.userName}>Welcome, John Doe</Text>
      </View>
      <TouchableOpacity style={styles.profileButton}>
        <Icon name="notifications-outline" size={wp('6%')} color="#FFD700" />
      </TouchableOpacity>
    </View>
  )
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
  userName: {
    fontSize: wp('6%'),
    fontWeight: '590',
    color: '#000',
    fontFamily:'SF Pro Display'
  },
  profileButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#131104',
    alignItems: 'center',
    justifyContent: 'center',
  },
})