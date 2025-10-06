// @ts-nocheck
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from "react-native-vector-icons/Ionicons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function UserHeader() {
  return (
    <View style={styles.header}>
             <View>
               <Text style={styles.greetingText}>Good afternoon</Text>
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
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
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