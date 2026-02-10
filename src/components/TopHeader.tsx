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
      {!no_navigate && (
        <TouchableOpacity
          onPress={() =>
            any_navigation
              ? navigation?.navigate(navigate_to)
              : navigation?.goBack()
          }
          activeOpacity={0.7}
        >
          {/* <Ionicons name="chevron-back" size={wp(6)} color="#000" /> */}
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: wp(6) }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#000',
  },
});
