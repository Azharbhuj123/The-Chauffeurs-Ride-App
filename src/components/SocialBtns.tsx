// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const fs = size => {
  return Math.sqrt(height * height + width * width) * (size / 1000);
};

export default function SocialBtns() {
  return (
    <View>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <Text style={styles.text}>Or</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <Image source={require('../assets/images/google.png')} />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <Icon name="logo-apple" size={wp(5)} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    textAlign: 'center',
    color: '#999',
    fontSize: fs(14),
    marginBottom: hp(2.5),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: wp(50),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    flex: 0.48,
    shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
   
  },
  socialText: {
    fontSize: fs(14),
    color: '#000',
    fontWeight: '500',
    marginLeft: wp(2),
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(4),
  },
  signInText: {
    fontSize: fs(14),
    color: '#666',
  },
  signInLink: {
    fontSize: fs(14),
    color: '#000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(1.5),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  text: {
    marginHorizontal: wp(2),
    color: '#999',
    fontSize: fs(14),
    textAlign: 'center',
  },
});
