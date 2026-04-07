// @ts-nocheck

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function TopHeader({
  title,
  navigation,
  no_navigate = false,
any_navigation = false,
  navigate_to,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {/* {!no_navigate && ( */}
          <TouchableOpacity
            onPress={() => {
              console.log('no_navigate');

              any_navigation
                ? navigation?.navigate(navigate_to)
                : navigation?.goBack();
            }}
          >
            <Ionicons   name="chevron-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
        {/* )} */}
      </View>

      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail"   pointerEvents="none"
>
        {title}
      </Text>

      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: wp(5),
  paddingVertical: hp(2),
},

  side: {
  width: wp(8),
  alignItems: 'flex-start',
},

headerTitle: {
  flex: 1,
  textAlign: 'center',
  fontSize: wp(4.5),
  fontWeight: '0',
        fontFamily:"Poppins-Regular",
  color: '#000',
  fontFamily:"Poppins-Regular",
},

  left: {
    flex: 1,
    alignItems: 'flex-start',
  },

  center: {
    flex: 1,
    alignItems: 'center',
  },

  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
